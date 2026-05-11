import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', async (req, res, next) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
        });
        res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (err) {
        next(err);
    }
});

router.post('/verify', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ verified: false, error: 'Missing payment fields' });
    }
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated = hmac.digest('hex');
    if (generated === razorpay_signature) {
        res.json({ verified: true });
    } else {
        res.status(400).json({ verified: false, error: 'Signature mismatch' });
    }
});

export default router;
