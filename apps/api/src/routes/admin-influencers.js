import { Router } from 'express';
import supabase from '../utils/supabaseClient.js';

const router = Router();

const verifyAdmin = async (authHeader) => {
    if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized');
    const token = authHeader.slice(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new Error('Unauthorized');
    const { data: customer } = await supabase.from('customers').select('role').eq('id', user.id).single();
    if (customer?.role !== 'admin') throw new Error('Forbidden');
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
        const { data: customers } = await supabase.from('customers').select('*').eq('email', customer_email).limit(1);
        if (!customers || customers.length === 0) {
            return res.status(404).json({ error: 'No customer found with that email. Please ensure they have registered an account first.' });
        }
        const customer = customers[0];

        const { data: existing } = await supabase.from('influencers').select('id').eq('customer_id', customer.id).limit(1);
        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'This customer is already an influencer.' });
        }

        const { data: newInf, error: infErr } = await supabase.from('influencers').insert({
            user_id: customer.id,
            customer_id: customer.id,
            influencer_code,
            status: status || 'active',
            total_earnings: 0,
            vedic_points: 0,
        }).select().single();
        if (infErr) throw infErr;

        const { error: couponErr } = await supabase.from('coupons').insert({
            coupon_code: influencer_code,
            discount_percentage: Number(discount_percentage) || 10,
            influencer_id: newInf.id,
            influencer_earning_percentage: 10,
            is_active: status === 'active',
            expires_at: expires_at ? new Date(expires_at).toISOString() : null,
        });
        if (couponErr) throw couponErr;

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
        const { error: infErr } = await supabase.from('influencers').update({
            influencer_code,
            status,
        }).eq('id', id);
        if (infErr) throw infErr;

        const { data: existingCoupons } = await supabase.from('coupons').select('*').eq('influencer_id', id);

        const couponData = {
            coupon_code: influencer_code,
            discount_percentage: Number(discount_percentage) || 10,
            is_active: status === 'active',
            expires_at: expires_at ? new Date(expires_at).toISOString() : null,
        };

        if (existingCoupons && existingCoupons.length > 0) {
            await supabase.from('coupons').update(couponData).eq('id', existingCoupons[0].id);
        } else {
            await supabase.from('coupons').insert({ ...couponData, influencer_id: id, influencer_earning_percentage: 10 });
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
        await supabase.from('coupons').delete().eq('influencer_id', id);
        await supabase.from('influencers').delete().eq('id', id);
        return res.json({ success: true });
    } catch (err) {
        console.error('Error deleting influencer:', err);
        return res.status(500).json({ error: err.message || 'Failed to delete influencer.' });
    }
});

export default router;
