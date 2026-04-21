import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import supabase from '@/lib/supabaseClient.js';
import { useToast } from '@/hooks/use-toast.js';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const EMPTY_FORM = {
  code: '',
  description: '',
  discount_type: 'percent',
  discount_value: '',
  status: 'active',
  valid_from: '',
  valid_until: '',
  usage_limit: '',
  min_order_amount: '',
};

function formatDate(val) {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { toast } = useToast();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created', { ascending: false });
      if (error) throw error;
      setCoupons(data ?? []);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load coupons.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingId(coupon.id);
      setFormData({
        code: coupon.code || '',
        description: coupon.description || '',
        discount_type: coupon.discount_type || 'percent',
        discount_value: coupon.discount_value ?? '',
        status: coupon.status || 'active',
        valid_from: coupon.valid_from ? coupon.valid_from.slice(0, 10) : '',
        valid_until: coupon.valid_until ? coupon.valid_until.slice(0, 10) : '',
        usage_limit: coupon.usage_limit ?? '',
        min_order_amount: coupon.min_order_amount ?? '',
      });
    } else {
      setEditingId(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      toast({ title: 'Validation', description: 'Coupon code is required.', variant: 'destructive' });
      return;
    }
    if (!formData.discount_value || isNaN(Number(formData.discount_value)) || Number(formData.discount_value) <= 0) {
      toast({ title: 'Validation', description: 'A valid discount value is required.', variant: 'destructive' });
      return;
    }
    if (formData.discount_type === 'percent' && Number(formData.discount_value) > 100) {
      toast({ title: 'Validation', description: 'Percentage discount cannot exceed 100.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim() || null,
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        status: formData.status,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null,
        usage_limit: formData.usage_limit !== '' ? Number(formData.usage_limit) : null,
        min_order_amount: formData.min_order_amount !== '' ? Number(formData.min_order_amount) : null,
      };

      if (editingId) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Success', description: 'Coupon updated.' });
      } else {
        const { error } = await supabase.from('coupons').insert({ ...payload, usage_count: 0 });
        if (error) throw error;
        toast({ title: 'Success', description: 'Coupon created.' });
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to save coupon.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = (id) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', deleteId);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Coupon removed.' });
      setCoupons(prev => prev.filter(c => c.id !== deleteId));
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete coupon.', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const filtered = coupons.filter(c =>
    c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCouponStatus = (coupon) => {
    const now = new Date();
    if (coupon.status !== 'active') return { label: 'Inactive', color: '#6b7280' };
    if (coupon.valid_until && new Date(coupon.valid_until) < now) return { label: 'Expired', color: '#c0392b' };
    if (coupon.valid_from && new Date(coupon.valid_from) > now) return { label: 'Scheduled', color: '#d97706' };
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) return { label: 'Exhausted', color: '#6b7280' };
    return { label: 'Active', color: '#166534' };
  };

  return (
    <>
      <Helmet>
        <title>Manage Coupons | Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Header />
      <main id="main">
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '56px 40px 80px' }}>

          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Tag size={24} style={{ color: 'var(--gold)' }} />
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: '28px', fontWeight: 400, color: 'var(--ink)' }}>
                Manage Coupons
              </h1>
            </div>
            <Button onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> New Coupon
            </Button>
          </div>

          {/* Search */}
          <div style={{ marginBottom: '24px', maxWidth: '360px' }}>
            <Input
              placeholder="Search by code or description…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Table */}
          {loading ? (
            <p style={{ fontSize: '13px', color: 'var(--ink-3)' }}>Loading coupons…</p>
          ) : filtered.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--ink-3)' }}>No coupons found.</p>
          ) : (
            <div style={{ border: '1px solid var(--line)', background: 'var(--white)' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valid From</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead style={{ width: '90px' }}></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(coupon => {
                    const statusInfo = getCouponStatus(coupon);
                    return (
                      <TableRow key={coupon.id}>
                        <TableCell style={{ fontWeight: 500, letterSpacing: '0.04em', fontFamily: 'monospace', fontSize: '13px' }}>
                          {coupon.code}
                        </TableCell>
                        <TableCell style={{ fontSize: '13px' }}>
                          {coupon.discount_type === 'percent'
                            ? `${coupon.discount_value}%`
                            : `₹${coupon.discount_value}`}
                        </TableCell>
                        <TableCell>
                          <span style={{
                            fontSize: '11px', fontWeight: 500, padding: '2px 8px',
                            borderRadius: '2px', background: statusInfo.color + '18', color: statusInfo.color,
                            letterSpacing: '0.04em',
                          }}>
                            {statusInfo.label}
                          </span>
                        </TableCell>
                        <TableCell style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{formatDate(coupon.valid_from)}</TableCell>
                        <TableCell style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{formatDate(coupon.valid_until)}</TableCell>
                        <TableCell style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
                          {coupon.usage_count ?? 0}
                          {coupon.usage_limit !== null ? ` / ${coupon.usage_limit}` : ' / ∞'}
                        </TableCell>
                        <TableCell style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
                          {coupon.min_order_amount ? `₹${coupon.min_order_amount}` : '—'}
                        </TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenModal(coupon)}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteConfirm(coupon.id)}
                              title="Delete"
                              style={{ color: '#c0392b' }}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* ── Add / Edit Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent style={{ maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '20px' }}>
              {editingId ? 'Edit Coupon' : 'New Coupon'}
            </DialogTitle>
          </DialogHeader>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px 0' }}>

            {/* Code */}
            <div style={{ display: 'grid', gap: '6px' }}>
              <Label>Coupon Code <span style={{ color: '#c0392b' }}>*</span></Label>
              <Input
                placeholder="e.g. SAVE20"
                value={formData.code}
                onChange={e => setFormData(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                style={{ letterSpacing: '0.06em', fontFamily: 'monospace' }}
              />
              <p style={{ fontSize: '11px', color: 'var(--ink-4)' }}>Uppercase letters and numbers only. Will be auto-uppercased.</p>
            </div>

            {/* Description */}
            <div style={{ display: 'grid', gap: '6px' }}>
              <Label>Description (shown to customer)</Label>
              <Input
                placeholder="e.g. Summer sale — 20% off your order"
                value={formData.description}
                onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Discount type + value */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'grid', gap: '6px' }}>
                <Label>Discount Type <span style={{ color: '#c0392b' }}>*</span></Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={v => setFormData(f => ({ ...f, discount_type: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                    <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div style={{ display: 'grid', gap: '6px' }}>
                <Label>
                  {formData.discount_type === 'percent' ? 'Percentage Off' : 'Amount Off (₹)'}
                  <span style={{ color: '#c0392b' }}> *</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  max={formData.discount_type === 'percent' ? 100 : undefined}
                  placeholder={formData.discount_type === 'percent' ? '20' : '100'}
                  value={formData.discount_value}
                  onChange={e => setFormData(f => ({ ...f, discount_value: e.target.value }))}
                />
              </div>
            </div>

            {/* Status */}
            <div style={{ display: 'grid', gap: '6px' }}>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={v => setFormData(f => ({ ...f, status: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Valid from / until */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'grid', gap: '6px' }}>
                <Label>Valid From</Label>
                <Input
                  type="date"
                  value={formData.valid_from}
                  onChange={e => setFormData(f => ({ ...f, valid_from: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gap: '6px' }}>
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={e => setFormData(f => ({ ...f, valid_until: e.target.value }))}
                />
              </div>
            </div>

            {/* Usage limit + min order */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'grid', gap: '6px' }}>
                <Label>Usage Limit</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={formData.usage_limit}
                  onChange={e => setFormData(f => ({ ...f, usage_limit: e.target.value }))}
                />
                <p style={{ fontSize: '11px', color: 'var(--ink-4)' }}>Leave empty for unlimited uses.</p>
              </div>
              <div style={{ display: 'grid', gap: '6px' }}>
                <Label>Minimum Order Amount (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="No minimum"
                  value={formData.min_order_amount}
                  onChange={e => setFormData(f => ({ ...f, min_order_amount: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter style={{ marginTop: '8px', gap: '8px' }}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : editingId ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent style={{ maxWidth: '400px' }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--serif)', fontWeight: 400 }}>Delete Coupon?</DialogTitle>
          </DialogHeader>
          <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.7 }}>
            This will permanently delete the coupon. Orders that already used this coupon will not be affected.
          </p>
          <DialogFooter style={{ gap: '8px' }}>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}