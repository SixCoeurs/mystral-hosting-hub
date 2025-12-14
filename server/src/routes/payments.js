import express from 'express';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

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
const BILLING_CYCLES = {
  monthly: { dbValue: 'monthly', months: 1, discount: 0 },
  quarterly: { dbValue: 'quarterly', months: 3, discount: 5 },
  semiannual: { dbValue: 'semiannual', months: 6, discount: 10 },
  annual: { dbValue: 'yearly', months: 12, discount: 15 },
  yearly: { dbValue: 'yearly', months: 12, discount: 15 }, // alias
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

    // Create service for the user (simplified - in production you'd have more details)
    const serviceUuid = uuidv4();
    try {
      const billingCycle = paymentIntent.metadata.billing_cycle || 'monthly';
      const billingConfig = getBillingConfig(billingCycle);
      const billingAmount = paymentIntent.amount / 100;

      await query(
        `INSERT INTO services (uuid, user_id, status, billing_cycle, billing_amount, next_due_date, current_specs)
         VALUES (?, ?, 'pending', ?, ?, DATE_ADD(NOW(), INTERVAL ? MONTH), '{}')`,
        [serviceUuid, userId, billingConfig.dbValue, billingAmount, billingConfig.months]
      );
      console.log('Service created:', serviceUuid, 'Billing:', billingConfig.dbValue, 'Next due in', billingConfig.months, 'months');
    } catch (dbErr) {
      console.log('Note: Could not create service:', dbErr.message);
    }

    res.json({
      success: true,
      message: 'Paiement confirmé avec succès',
      serviceUuid: serviceUuid,
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

export default router;
