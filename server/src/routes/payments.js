import express from 'express';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { sendPurchaseConfirmationEmail } from '../services/email.js';

const router = express.Router();

// Initialize Stripe (only if key is configured)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY not configured - payment features disabled');
}

// Middleware to check if Stripe is configured
function requireStripe(req, res, next) {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Service de paiement non configuré',
    });
  }
  next();
}

// Helper to convert BigInt to Number
function toNumber(val) {
  return typeof val === 'bigint' ? Number(val) : val;
}

// Billing cycle configuration with discounts and intervals
// NOTE: DB ENUM only has: monthly, quarterly, yearly
// For semiannual, we store 'yearly' but with 6 months interval
const BILLING_CYCLES = {
  monthly: { dbValue: 'monthly', months: 1, discount: 0, label: 'mensuel' },
  quarterly: { dbValue: 'quarterly', months: 3, discount: 5, label: 'trimestriel' },
  semiannual: { dbValue: 'yearly', months: 6, discount: 10, label: 'semestriel' }, // DB workaround: stored as 'yearly'
  biannual: { dbValue: 'yearly', months: 6, discount: 10, label: 'semestriel' }, // alias
  annual: { dbValue: 'yearly', months: 12, discount: 15, label: 'annuel' },
  yearly: { dbValue: 'yearly', months: 12, discount: 15, label: 'annuel' }, // alias
};

// Get billing cycle config (with fallback to monthly)
function getBillingConfig(cycle) {
  return BILLING_CYCLES[cycle] || BILLING_CYCLES.monthly;
}

// Calculate discounted price
function applyDiscount(basePrice, discountPercent) {
  return basePrice * (1 - discountPercent / 100);
}

// POST /payments/create-intent - Create a PaymentIntent for checkout
router.post('/create-intent', authenticate, requireStripe, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      items,           // Array of { product_slug, quantity, billing_cycle }
      billing_cycle,   // 'monthly', 'quarterly', 'semiannual', 'annual'
      location_code,   // Location code
      addons,          // Array of addon slugs
      customer_info,   // { first_name, last_name, email, etc. }
    } = req.body;

    // Get billing configuration
    const billingConfig = getBillingConfig(billing_cycle);

    // Calculate total amount
    let totalAmount = 0;

    // Get the base monthly price
    if (req.body.amount) {
      // Direct amount (in euros) - this is already the final amount with discounts applied
      totalAmount = Math.round(req.body.amount * 100); // Convert to cents
    } else if (req.body.monthlyPrice) {
      // Calculate from monthly price with discount
      const baseMonthlyAmount = parseFloat(req.body.monthlyPrice);
      const discountedMonthly = applyDiscount(baseMonthlyAmount, billingConfig.discount);
      totalAmount = Math.round(discountedMonthly * billingConfig.months * 100);
    } else {
      // Calculate from items (simplified)
      totalAmount = Math.round((req.body.total || 9.99) * 100);
    }

    // Minimum amount for Stripe is 50 cents
    if (totalAmount < 50) {
      totalAmount = 50;
    }

    // Create order in database
    const orderUuid = uuidv4();

    try {
      await query(
        `INSERT INTO orders (uuid, user_id, subtotal, total, status, ip_address)
         VALUES (?, ?, ?, ?, 'pending', ?)`,
        [orderUuid, userId, totalAmount / 100, totalAmount / 100, req.ip || '']
      );
    } catch (dbErr) {
      console.log('Note: orders table may not exist, continuing without DB order:', dbErr.message);
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'eur',
      metadata: {
        user_id: String(toNumber(userId)),
        user_email: req.user.email,
        order_uuid: orderUuid,
        billing_cycle: billing_cycle || 'monthly',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('PaymentIntent created:', paymentIntent.id, 'Amount:', totalAmount / 100, 'EUR',
      'Cycle:', billing_cycle || 'monthly', 'Discount:', billingConfig.discount + '%');

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderUuid: orderUuid,
    });
  } catch (err) {
    console.error('Create payment intent error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Erreur lors de la création du paiement',
    });
  }
});

// POST /payments/confirm - Confirm payment was successful (called by frontend after Stripe confirms)
router.post('/confirm', authenticate, requireStripe, async (req, res) => {
  try {
    const { paymentIntentId, orderUuid } = req.body;
    const userId = req.user.id;

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Le paiement n\'a pas été confirmé',
        status: paymentIntent.status,
      });
    }

    // Update order status
    try {
      await query(
        `UPDATE orders SET status = 'paid', paid_at = NOW() WHERE uuid = ? AND user_id = ?`,
        [orderUuid, userId]
      );
    } catch (dbErr) {
      console.log('Note: Could not update order status:', dbErr.message);
    }

    // Get billing configuration
    const billingCycle = paymentIntent.metadata.billing_cycle || 'monthly';
    const billingConfig = getBillingConfig(billingCycle);
    const billingAmount = paymentIntent.amount / 100;

    // Create service for the user
    const serviceUuid = uuidv4();
    try {
      await query(
        `INSERT INTO services (uuid, user_id, status, billing_cycle, billing_amount, next_due_date, current_specs)
         VALUES (?, ?, 'pending', ?, ?, DATE_ADD(NOW(), INTERVAL ? MONTH), '{}')`,
        [serviceUuid, userId, billingConfig.dbValue, billingAmount, billingConfig.months]
      );
      console.log('Service created:', serviceUuid, 'Billing:', billingConfig.dbValue, 'Next due in', billingConfig.months, 'months');
    } catch (dbErr) {
      console.log('Note: Could not create service:', dbErr.message);
    }

    // Create invoice for the user (matching actual DB schema)
    const invoiceUuid = uuidv4();
    const currentYear = new Date().getFullYear();
    const invoiceNumber = `INV-${currentYear}-${Date.now().toString().slice(-6)}`;

    // Get user billing address for invoice
    let billingAddress = {};
    try {
      const userInfo = await query(
        `SELECT first_name, last_name, email, company_name, address_line1, address_line2, city, postal_code, country_code
         FROM users WHERE id = ?`,
        [userId]
      );
      if (userInfo.length > 0) {
        billingAddress = {
          first_name: userInfo[0].first_name,
          last_name: userInfo[0].last_name,
          email: userInfo[0].email,
          company_name: userInfo[0].company_name || null,
          address_line1: userInfo[0].address_line1 || null,
          address_line2: userInfo[0].address_line2 || null,
          city: userInfo[0].city || null,
          postal_code: userInfo[0].postal_code || null,
          country_code: userInfo[0].country_code || 'FR',
        };
      }
    } catch (err) {
      console.log('Note: Could not fetch user billing address:', err.message);
    }

    try {
      await query(
        `INSERT INTO invoices (uuid, invoice_number, user_id, subtotal, tax_amount, tax_rate, discount_amount, total, amount_paid, status, issue_date, due_date, paid_at, billing_address, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', CURDATE(), CURDATE(), NOW(), ?, ?)`,
        [
          invoiceUuid,
          invoiceNumber,
          userId,
          billingAmount,        // subtotal
          0,                    // tax_amount
          0,                    // tax_rate
          0,                    // discount_amount
          billingAmount,        // total
          billingAmount,        // amount_paid (fully paid)
          JSON.stringify(billingAddress),
          `Paiement ${billingConfig.label}`
        ]
      );
      console.log('Invoice created:', invoiceNumber);
    } catch (dbErr) {
      console.log('Note: Could not create invoice:', dbErr.message);
    }

    // Calculate next due date for email
    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + billingConfig.months);

    // Send purchase confirmation email (async, don't wait)
    sendPurchaseConfirmationEmail(
      {
        email: billingAddress.email || req.user.email,
        first_name: billingAddress.first_name || req.user.first_name,
        last_name: billingAddress.last_name || req.user.last_name,
      },
      {
        description: `Service Mystral - ${billingConfig.label}`,
        amount: billingAmount,
        discount: billingConfig.discount > 0 ? (billingAmount * billingConfig.discount / (100 - billingConfig.discount)) : 0,
        total: billingAmount,
        billingCycle: billingConfig.label,
        billingLabel: billingConfig.label,
        invoiceNumber: invoiceNumber,
        nextDueDate: nextDueDate.toLocaleDateString('fr-FR'),
      }
    ).catch(err => {
      console.error('Failed to send purchase confirmation email:', err);
    });

    res.json({
      success: true,
      message: 'Paiement confirme avec succes',
      serviceUuid: serviceUuid,
      invoiceNumber: invoiceNumber,
    });
  } catch (err) {
    console.error('Confirm payment error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation du paiement',
    });
  }
});

// GET /payments/config - Get Stripe publishable key
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

// GET /payments/status/:paymentIntentId - Check real payment status from Stripe
router.get('/status/:paymentIntentId', requireStripe, async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId || !paymentIntentId.startsWith('pi_')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment intent ID',
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    });
  } catch (err) {
    console.error('Get payment status error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du paiement',
      status: 'error',
    });
  }
});

// POST /payments/webhook - Stripe webhook handler (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      // For testing without webhook secret
      event = JSON.parse(req.body);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      // Update order/service status in database
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// GET /payments/invoices - List user invoices
router.get('/invoices', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const invoices = await query(
      `SELECT uuid, invoice_number, subtotal, tax_amount, total, status,
              paid_at, due_date, issue_date, notes, created_at
       FROM invoices
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM invoices WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      invoices: invoices.map(inv => ({
        uuid: inv.uuid,
        invoice_number: inv.invoice_number,
        amount: parseFloat(inv.subtotal || 0),
        tax_amount: parseFloat(inv.tax_amount || 0),
        total: parseFloat(inv.total || 0),
        status: inv.status,
        paid_at: inv.paid_at,
        due_date: inv.due_date,
        issue_date: inv.issue_date,
        description: inv.notes || '',
        created_at: inv.created_at,
      })),
      total: toNumber(countResult[0].total),
    });
  } catch (err) {
    console.error('Get invoices error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des factures',
    });
  }
});

// GET /payments/invoices/:uuid - Get specific invoice
router.get('/invoices/:uuid', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { uuid } = req.params;

    const invoices = await query(
      `SELECT i.uuid, i.invoice_number, i.subtotal, i.tax_amount, i.tax_rate,
              i.discount_amount, i.total, i.amount_paid, i.status,
              i.issue_date, i.due_date, i.paid_at, i.billing_address, i.notes,
              i.created_at
       FROM invoices i
       WHERE i.uuid = ? AND i.user_id = ?`,
      [uuid, userId]
    );

    if (invoices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée',
      });
    }

    const invoice = invoices[0];

    // Parse billing_address JSON
    let customer = {};
    try {
      customer = typeof invoice.billing_address === 'string'
        ? JSON.parse(invoice.billing_address)
        : invoice.billing_address || {};
    } catch {
      customer = {};
    }

    res.json({
      success: true,
      invoice: {
        uuid: invoice.uuid,
        invoice_number: invoice.invoice_number,
        amount: parseFloat(invoice.subtotal || 0),
        tax_amount: parseFloat(invoice.tax_amount || 0),
        tax_rate: parseFloat(invoice.tax_rate || 0),
        discount_amount: parseFloat(invoice.discount_amount || 0),
        total: parseFloat(invoice.total || 0),
        amount_paid: parseFloat(invoice.amount_paid || 0),
        status: invoice.status,
        paid_at: invoice.paid_at,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        description: invoice.notes || '',
        created_at: invoice.created_at,
        customer: customer,
      },
    });
  } catch (err) {
    console.error('Get invoice error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la facture',
    });
  }
});

export default router;
