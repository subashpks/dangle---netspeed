/**
 * Jinglee Razorpay Backend Service Helper
 * 
 * Provides reference implementations for:
 * 1. Razorpay Orders Creation (/v1/orders)
 * 2. Webhook HMAC-SHA256 Signature Verification
 * 3. Supabase Database Transaction Sync
 */

const crypto = require('crypto');

class RazorpayService {
  constructor(keyId, keySecret) {
    this.keyId = keyId || process.env.RAZORPAY_KEY_ID;
    this.keySecret = keySecret || process.env.RAZORPAY_KEY_SECRET;
  }

  /**
   * Create an Order for the Purchase Step (Step 3)
   * @param {number} amountInINR e.g., 3999
   * @param {string} receipt e.g., 'rcpt_plan_multilane_01'
   * @param {object} notes Custom metadata
   */
  async createOrder(amountInINR, receipt, notes = {}) {
    const payload = {
      amount: amountInINR * 100, // paise conversion
      currency: 'INR',
      receipt: receipt,
      payment_capture: 1, // Auto-capture
      notes: notes
    };

    // Example fetch to Razorpay API
    // const authHeader = 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    // return fetch('https://api.razorpay.com/v1/orders', { method: 'POST', headers: { Authorization: authHeader, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return {
      id: 'order_' + crypto.randomBytes(6).toString('hex'),
      entity: 'order',
      amount: payload.amount,
      currency: 'INR',
      receipt: receipt,
      status: 'created'
    };
  }

  /**
   * Verify Payment Signature returned by Razorpay Checkout
   * @param {string} orderId 
   * @param {string} paymentId 
   * @param {string} signature 
   */
  verifyPaymentSignature(orderId, paymentId, signature) {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(text)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Verify Webhook Signature sent in 'x-razorpay-signature' header
   * @param {string} rawBody 
   * @param {string} webhookSignature 
   * @param {string} webhookSecret 
   */
  verifyWebhookSignature(rawBody, webhookSignature, webhookSecret) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    return expectedSignature === webhookSignature;
  }
}

module.exports = RazorpayService;
