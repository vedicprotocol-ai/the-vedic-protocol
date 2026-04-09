import { Router } from 'express';
import Pocketbase from 'pocketbase';
import pb from '../utils/pocketbaseClient.js';

const router = Router();

const verifyAdmin = async (authHeader) => {
    if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized');
    const token = authHeader.slice(7);
    const tempPb = new Pocketbase('http://localhost:8090');
    tempPb.authStore.save(token, null);
    try {
        const result = await tempPb.collection('customers').authRefresh({ $autoCancel: false });
        if (result.record?.role !== 'admin') throw new Error('Forbidden');
    } catch {
        throw new Error('Unauthorized');
    }
};

// POST /admin/influencers — create influencer + coupon
router.post('/', async (req, res) => {
    try {
        await verifyAdmin(req.headers.authorization);
    } catch (err) {
        return res.status(401).json({ error: err.message });
    }

    const { customer_email, influencer_code, discount_percentage, expires_at, status } = req.body;

    if (!customer_email || !influencer_code) {
        return res.status(400).json({ error: 'customer_email and influencer_code are required.' });
    }

    try {
        // Find customer by email
        const customers = await pb.collection('customers').getFullList({
            filter: `email = "${customer_email}"`,
            $autoCancel: false
        });
        if (customers.length === 0) {
            return res.status(404).json({ error: 'No customer found with that email. Please ensure they have registered an account first.' });
        }
        const customer = customers[0];

        // Check not already an influencer
        const existing = await pb.collection('influencers').getFullList({
            filter: `customer_id = "${customer.id}"`,
            $autoCancel: false
        });
        if (existing.length > 0) {
            return res.status(409).json({ error: 'This customer is already an influencer.' });
        }

        // Create influencer
        const newInf = await pb.collection('influencers').create({
            user_id: customer.id,
            customer_id: customer.id,
            influencer_code,
            status: status || 'active',
            total_earnings: 0,
            vedic_points: 0
        }, { $autoCancel: false });

        // Create coupon
        await pb.collection('coupons').create({
            coupon_code: influencer_code,
            discount_percentage: Number(discount_percentage) || 10,
            influencer_id: newInf.id,
            influencer_earning_percentage: 10,
            is_active: status === 'active',
            expires_at: expires_at ? new Date(expires_at).toISOString() : null
        }, { $autoCancel: false });

        return res.json({ success: true, id: newInf.id });
    } catch (err) {
        console.error('Error creating influencer:', err);
        return res.status(500).json({ error: err.message || 'Failed to create influencer.' });
    }
});

// PUT /admin/influencers/:id — update influencer + coupon
router.put('/:id', async (req, res) => {
    try {
        await verifyAdmin(req.headers.authorization);
    } catch (err) {
        return res.status(401).json({ error: err.message });
    }

    const { id } = req.params;
    const { influencer_code, discount_percentage, expires_at, status } = req.body;

    try {
        await pb.collection('influencers').update(id, {
            influencer_code,
            status
        }, { $autoCancel: false });

        const existingCoupons = await pb.collection('coupons').getFullList({
            filter: `influencer_id = "${id}"`,
            $autoCancel: false
        });

        const couponData = {
            coupon_code: influencer_code,
            discount_percentage: Number(discount_percentage) || 10,
            is_active: status === 'active',
            expires_at: expires_at ? new Date(expires_at).toISOString() : null
        };

        if (existingCoupons.length > 0) {
            await pb.collection('coupons').update(existingCoupons[0].id, couponData, { $autoCancel: false });
        } else {
            await pb.collection('coupons').create({
                ...couponData,
                influencer_id: id,
                influencer_earning_percentage: 10
            }, { $autoCancel: false });
        }

        return res.json({ success: true });
    } catch (err) {
        console.error('Error updating influencer:', err);
        return res.status(500).json({ error: err.message || 'Failed to update influencer.' });
    }
});

// DELETE /admin/influencers/:id — delete coupon(s) then influencer
router.delete('/:id', async (req, res) => {
    try {
        await verifyAdmin(req.headers.authorization);
    } catch (err) {
        return res.status(401).json({ error: err.message });
    }

    const { id } = req.params;

    try {
        const coupons = await pb.collection('coupons').getFullList({
            filter: `influencer_id = "${id}"`,
            $autoCancel: false
        });
        await Promise.all(coupons.map(c =>
            pb.collection('coupons').delete(c.id, { $autoCancel: false })
        ));
        await pb.collection('influencers').delete(id, { $autoCancel: false });
        return res.json({ success: true });
    } catch (err) {
        console.error('Error deleting influencer:', err);
        return res.status(500).json({ error: err.message || 'Failed to delete influencer.' });
    }
});

export default router;
