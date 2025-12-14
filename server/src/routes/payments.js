import express from 'express';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper to convert BigInt to Number
function toNumber(val) {
  return typeof val === 'bigint' ? Number(val) : val;
}

// POST /payments/create-intent - Create a PaymentIntent for checkout
router.post('/create-intent', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      items,           // Array of { product_slug, quantity, billing_cycle }
      billing_cycle,   // 'monthly', 'quarterly', 'yearly'
      location_code,   // Location code
      addons,          // Array of addon slugs
      customer_info,   // { first_name, last_name, email, etc. }
    } = req.body;

    // Calculate total amount
    let totalAmount = 0;
    let orderItems = [];

    // For now, we'll use a simplified calculation
    // In production, you'd fetch real prices from the database
    if (req.body.amount) {
      // Direct amount (in euros)
      totalAmount = Math.round(req.body.amount * 100); // Convert to cents
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

    console.log('PaymentIntent created:', paymentIntent.id, 'Amount:', totalAmount / 100, 'EUR');

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
router.post('/confirm', authenticate, async (req, res) => {
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
      await query(
        `INSERT INTO services (uuid, user_id, status, billing_cycle, billing_amount, next_due_date, current_specs)
         VALUES (?, ?, 'pending', ?, ?, DATE_ADD(NOW(), INTERVAL 1 MONTH), '{}')`,
        [serviceUuid, userId, paymentIntent.metadata.billing_cycle || 'monthly', paymentIntent.amount / 100]
      );
      console.log('Service created:', serviceUuid);
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

// POST /payments/webhook - Stripe webhook handler (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
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
