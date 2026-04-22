import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Plus, Edit2, Trash2, TrendingUp, Users, ShoppingBag, Activity } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import supabase from '@/lib/supabaseClient.js';
import { useToast } from '@/hooks/use-toast.js';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function AdminInfluencersPage() {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    customer_email: '',
    influencer_code: '',
    discount_percentage: 10,
    commission_percent: 0,
    expires_at: '',
    status: 'active'
  });

  const [selectedEarningsId, setSelectedEarningsId] = useState('');
  const [earningsData, setEarningsData] = useState(null);
  const [earningsLoading, setEarningsLoading] = useState(false);

  const { toast } = useToast();

  const fetchEarnings = async (influencerId) => {
    if (!influencerId) { setEarningsData(null); return; }
    setEarningsLoading(true);
    try {
      const { data: inf } = await supabase.from('influencers').select('*').eq('id', influencerId).single();
      const { data: couponsList } = await supabase.from('coupons').select('*').eq('influencer_id', influencerId).limit(10);
      const coupon = couponsList?.[0] || null;
      const code = inf?.influencer_code;
      const commissionPct = inf?.commission_percent ?? 0;

      let orders = [];
      if (code) {
        const { data: ordersData } = await supabase
          .from('orders')
          .select('id, customer_id, total, shipping, discount, coupon_code, created, status, customer:customer_id(name, email)')
          .eq('coupon_code', code)
          .order('created', { ascending: false });

        orders = (ordersData ?? []).map(o => {
          const orderValue = (o.total || 0) - (o.shipping || 0);
          return { ...o, orderValue, commission: orderValue * commissionPct / 100 };
        });
      }

      const totalOrderValue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalCommission = orders.reduce((sum, o) => sum + o.commission, 0);
      const uniqueCustomers = new Set(orders.map(o => o.customer_id).filter(Boolean)).size;

      setEarningsData({
        influencer: inf,
        coupon,
        orders,
        stats: {
          totalEarnings: totalCommission,
          commissionPct,
          uniqueCustomers,
          totalPurchases: orders.length,
          avgOrderValue: orders.length > 0 ? totalOrderValue / orders.length : 0,
        },
      });
    } catch (err) {
      console.error('Earnings fetch error:', err);
    } finally {
      setEarningsLoading(false);
    }
  };

  const formatEarningsDate = (dateString) => {
    const date = new Date(dateString);
    const diffDays = Math.floor(Math.abs(new Date() - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const fetchInfluencers = async () => {
    setLoading(true);
    try {
      const { data: infRes } = await supabase.from('influencers')
        .select('*, customer:customer_id(*)').order('created', { ascending: false });
      const { data: coupRes } = await supabase.from('coupons').select('*');

      const merged = (infRes ?? []).map(inf => ({
        ...inf,
        coupon: (coupRes ?? []).find(c => c.influencer_id === inf.id) || null,
      }));

      setInfluencers(merged);
    } catch (error) {
      console.error('Error fetching influencers:', error);
      toast({
        title: "Error",
        description: "Failed to load influencers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const handleOpenModal = (influencer = null) => {
    if (influencer) {
      setEditingId(influencer.id);
      setFormData({
        customer_email: influencer.customer?.email || '',
        influencer_code: influencer.influencer_code || '',
        discount_percentage: influencer.coupon?.discount_value || 10,
        commission_percent: influencer.commission_percent ?? 10,
        expires_at: influencer.coupon?.valid_until ? influencer.coupon.valid_until.split('T')[0] : '',
        status: influencer.status || 'active'
      });
    } else {
      setEditingId(null);
      setFormData({
        customer_email: '',
        influencer_code: '',
        discount_percentage: 10,
        commission_percent: 0,
        expires_at: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.customer_email || !formData.influencer_code) {
      toast({ title: "Validation Error", description: "Email and Influencer Code are required.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (!editingId) {
        const { data: customers } = await supabase.from('customers')
          .select('*').eq('email', formData.customer_email).limit(1);
        if (!customers || customers.length === 0) throw new Error('No customer found with that email. Please ensure they have registered an account first.');

        const customer = customers[0];
        const { data: existingInf } = await supabase.from('influencers')
          .select('id').eq('customer_id', customer.id).limit(1);
        if (existingInf && existingInf.length > 0) throw new Error('This customer is already an influencer.');

        const { data: newInf, error: infErr } = await supabase.from('influencers').insert({
          user_id: customer.id,
          customer_id: customer.id,
          influencer_code: formData.influencer_code,
          commission_percent: Number(formData.commission_percent),
          status: formData.status,
        }).select().single();
        if (infErr) throw infErr;

        await supabase.from('coupons').insert({
          code: formData.influencer_code,
          discount_type: 'percentage',
          discount_value: Number(formData.discount_percentage),
          influencer_id: newInf.id,
          status: formData.status === 'active' ? 'active' : 'inactive',
          valid_until: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        });

      } else {
        await supabase.from('influencers').update({
          influencer_code: formData.influencer_code,
          commission_percent: Number(formData.commission_percent),
          status: formData.status,
        }).eq('id', editingId);

        const { data: existingCoupons } = await supabase.from('coupons')
          .select('*').eq('influencer_id', editingId);

        const couponData = {
          code: formData.influencer_code,
          discount_type: 'percentage',
          discount_value: Number(formData.discount_percentage),
          status: formData.status === 'active' ? 'active' : 'inactive',
          valid_until: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        };

        if (existingCoupons && existingCoupons.length > 0) {
          await supabase.from('coupons').update(couponData).eq('id', existingCoupons[0].id);
        } else {
          await supabase.from('coupons').insert({ ...couponData, influencer_id: editingId });
        }
      }

      toast({ title: "Success", description: "Influencer saved successfully." });
      setIsModalOpen(false);
      fetchInfluencers();
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: "Error", description: error.message || "Failed to save influencer.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this influencer? This will also delete their associated coupons.")) return;

    try {
      await supabase.from('coupons').delete().eq('influencer_id', id);
      await supabase.from('influencers').delete().eq('id', id);
      toast({ title: "Success", description: "Influencer deleted successfully." });
      fetchInfluencers();
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: "Error", description: error.message || "Failed to delete influencer.", variant: "destructive" });
    }
  };

  const filteredInfluencers = influencers.filter(inf => {
    const name = inf.customer?.name?.toLowerCase() || '';
    const email = inf.customer?.email?.toLowerCase() || '';
    const code = inf.influencer_code?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return name.includes(q) || email.includes(q) || code.includes(q);
  });

  return (
    <div className="min-h-screen bg-[#fcfbf9] flex flex-col">
      <Helmet>
        <title>Manage Influencers | Admin | The Vedic Protocol</title>
      </Helmet>

      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 mt-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-amber-700 mb-2">Administration</p>
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900">Manage Influencers</h1>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-gray-900 text-white hover:bg-gray-800 rounded-none px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Influencer
          </Button>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm mb-8">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-gray-200 rounded-none focus-visible:ring-amber-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">Name</TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">Email</TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">Coupon Code</TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">Discount</TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">Commission</TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">Validity</TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">Earnings</TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">Status</TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                      Loading influencers...
                    </TableCell>
                  </TableRow>
                ) : filteredInfluencers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                      No influencers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInfluencers.map((inf) => (
                    <TableRow key={inf.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-900">
                        {inf.customer?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {inf.customer?.email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-gray-100 text-gray-800 border border-gray-200">
                          {inf.influencer_code}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {inf.coupon?.discount_value ? `${inf.coupon.discount_value}%` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {inf.commission_percent != null ? `${inf.commission_percent}%` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {inf.coupon?.valid_until
                          ? new Date(inf.coupon.valid_until).toLocaleDateString()
                          : 'No Expiry'}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        ₹{Number(inf.total_earnings ?? 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inf.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {inf.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(inf)}
                            className="h-8 px-2 text-gray-600 hover:text-gray-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(inf.id)}
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* ── Earnings Viewer ── */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-amber-700 mb-1">Earnings Viewer</p>
              <h2 className="text-2xl font-serif text-gray-900">View Influencer Earnings</h2>
            </div>
            <div className="w-full sm:w-72">
              <Select
                value={selectedEarningsId}
                onValueChange={(val) => { setSelectedEarningsId(val); fetchEarnings(val); }}
              >
                <SelectTrigger className="rounded-none border-gray-300 focus:ring-gray-400">
                  <SelectValue placeholder="Select an influencer..." />
                </SelectTrigger>
                <SelectContent className="rounded-none border-gray-200">
                  {influencers.map(inf => (
                    <SelectItem key={inf.id} value={inf.id}>
                      {inf.customer?.name || inf.customer?.email || inf.influencer_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {earningsLoading && (
            <div className="animate-pulse">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[1,2,3].map(i => <div key={i} className="h-36 bg-stone-200 rounded-2xl" />)}
              </div>
              <div className="h-64 bg-stone-200 rounded-2xl" />
            </div>
          )}

          {!earningsLoading && earningsData && (() => {
            const { influencer, coupon, orders, stats } = earningsData;
            const displayCode = coupon?.code || influencer?.influencer_code;

            return (
              <div>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">

                  {/* Active Code */}
                  <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-[#8c8c8c]">
                        <Activity size={16} />
                        <span className="text-xs uppercase tracking-wider font-medium">Active Code</span>
                      </div>
                      {displayCode ? (
                        <>
                          <p className="font-serif text-2xl sm:text-3xl text-[var(--ink)] mb-1 tracking-[0.02em] break-all">{displayCode}</p>
                          {coupon && (
                            <p className="text-xs sm:text-sm text-[#8c8c8c]">{coupon.discount_value}% discount for audience</p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-[#595959]">No code assigned</p>
                      )}
                    </div>
                    <div className="mt-4 text-xs text-[#8c8c8c] border-t border-[#f0f0f0] pt-3">
                      Status: <span className={`font-medium ${influencer?.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>{influencer?.status || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Total Earnings */}
                  <div className="bg-[#1a1a1a] rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-10 rounded-full -mr-10 -mt-10 blur-3xl pointer-events-none" />
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-white/60">
                        <TrendingUp size={16} />
                        <span className="text-xs uppercase tracking-wider font-medium">Total Earnings</span>
                      </div>
                      <p className="font-serif text-4xl sm:text-5xl text-[#D4AF37] leading-none">
                        ₹{Number(stats.totalEarnings).toFixed(2)}
                      </p>
                    </div>
                    <div className="mt-5 flex items-center justify-between text-xs text-white/50 border-t border-white/10 pt-4">
                      <span>Lifetime earnings from referrals</span>
                      {stats.commissionPct > 0 && (
                        <span className="text-[#D4AF37]/70">{stats.commissionPct}% commission</span>
                      )}
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-5 text-[#8c8c8c]">
                      <ShoppingBag size={16} />
                      <span className="text-xs uppercase tracking-wider font-medium">Performance</span>
                    </div>
                    <div className="space-y-3 flex-grow flex flex-col justify-center">
                      <div className="flex justify-between items-end">
                        <span className="text-sm text-[#595959]">Total Customers</span>
                        <span className="font-serif text-xl text-[#1a1a1a]">{stats.uniqueCustomers}</span>
                      </div>
                      <div className="w-full h-px bg-[#f0f0f0]" />
                      <div className="flex justify-between items-end">
                        <span className="text-sm text-[#595959]">Total Purchases</span>
                        <span className="font-serif text-xl text-[#1a1a1a]">{stats.totalPurchases}</span>
                      </div>
                      <div className="w-full h-px bg-[#f0f0f0]" />
                      <div className="flex justify-between items-end">
                        <span className="text-sm text-[#595959]">Avg. Order Value</span>
                        <span className="font-serif text-xl text-[#D4AF37]">₹{stats.avgOrderValue.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Recent Referrals Table */}
                <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-[#e5e5e5] flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl text-gray-900">Recent Referrals</h3>
                      <p className="text-xs sm:text-sm text-[#8c8c8c] mt-1">Purchases made using this influencer's code</p>
                    </div>
                    <div className="text-xs font-medium text-[#595959] bg-[#fafafa] px-3 py-1.5 rounded-md border border-[#e5e5e5] self-start sm:self-auto">
                      {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-10 text-center bg-[#fafafa]">
                      <div className="w-14 h-14 rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Users size={24} className="text-[#bfbfbf]" />
                      </div>
                      <p className="font-serif text-lg text-gray-900 mb-2">No referrals yet</p>
                      <p className="text-sm text-[#8c8c8c]">No orders have been placed using this influencer's code.</p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile cards */}
                      <div className="flex flex-col gap-3 p-4 sm:hidden bg-[#fafafa]">
                        {orders.map(record => {
                          const customerName = record.customer?.name || 'Anonymous Customer';
                          return (
                            <div key={record.id} className="bg-white p-4 rounded-xl border border-[#e5e5e5] shadow-sm flex flex-col gap-3">
                              <div className="flex justify-between items-center border-b border-[#f0f0f0] pb-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-[#f0f0f0] text-[#595959] flex items-center justify-center text-xs font-medium border border-[#e5e5e5]">
                                    {customerName.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm font-medium text-[#1a1a1a] truncate max-w-[120px]">{customerName}</span>
                                </div>
                                <span className="text-xs text-[#595959] whitespace-nowrap">{formatEarningsDate(record.created)}</span>
                              </div>
                              <div className="flex justify-between"><span className="text-xs text-[#8c8c8c]">Order Total</span><span className="text-sm font-medium text-[#1a1a1a]">₹{(record.total || 0).toFixed(0)}</span></div>
                              <div className="flex justify-between"><span className="text-xs text-[#8c8c8c]">Discount Applied</span><span className="text-sm text-[#8c8c8c]">₹{(record.discount || 0).toFixed(0)}</span></div>
                              <div className="flex justify-between"><span className="text-xs text-[#8c8c8c]">Commission</span><span className="text-sm font-medium text-[#D4AF37]">₹{record.commission.toFixed(2)}</span></div>
                              <div className="flex justify-between pt-2 border-t border-[#f0f0f0]">
                                <span className="text-xs font-medium text-[#1a1a1a]">Status</span>
                                <span className="text-xs capitalize text-[#595959]">{record.status}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Desktop table */}
                      <div className="w-full overflow-x-auto hidden sm:block">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                              <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-semibold text-[#8c8c8c]">Customer</th>
                              <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-semibold text-[#8c8c8c]">Date</th>
                              <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-semibold text-[#8c8c8c] text-right">Order Total</th>
                              <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-semibold text-[#8c8c8c] text-right">Discount Applied</th>
                              <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-semibold text-[#8c8c8c] text-right">Commission</th>
                              <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-semibold text-[#8c8c8c] text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f0f0f0]">
                            {orders.map(record => {
                              const customerName = record.customer?.name || 'Anonymous Customer';
                              return (
                                <tr key={record.id} className="hover:bg-[#fafafa] transition-colors duration-150">
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-[#f0f0f0] text-[#595959] flex items-center justify-center text-xs font-medium border border-[#e5e5e5]">
                                        {customerName.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-[#1a1a1a]">{customerName}</p>
                                        {record.customer?.email && <p className="text-xs text-[#8c8c8c]">{record.customer.email}</p>}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6 text-sm text-[#595959]">{formatEarningsDate(record.created)}</td>
                                  <td className="py-4 px-6 text-sm text-[#1a1a1a] text-right font-medium">₹{(record.total || 0).toFixed(0)}</td>
                                  <td className="py-4 px-6 text-sm text-[#8c8c8c] text-right">₹{(record.discount || 0).toFixed(0)}</td>
                                  <td className="py-4 px-6 text-sm text-right font-medium text-[#D4AF37]">₹{record.commission.toFixed(2)}</td>
                                  <td className="py-4 px-6 text-right">
                                    <span className="text-xs capitalize px-2 py-1 rounded bg-[#f0f0f0] text-[#595959]">{record.status}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          {!earningsLoading && !earningsData && selectedEarningsId === '' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select an influencer above to view their earnings.</p>
            </div>
          )}
        </div>

      </main>

      <Footer />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-none border-gray-200" style={{ '--ring': '0 0% 60%' }}>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-gray-900">
              {editingId ? 'Edit Influencer' : 'Add New Influencer'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-gray-500">Customer Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                disabled={!!editingId}
                placeholder="customer@example.com"
                className="rounded-none border-gray-300 focus-visible:ring-gray-400"
              />
              {!editingId && <p className="text-xs text-gray-500">Customer must already have an account.</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="code" className="text-xs uppercase tracking-wider text-gray-500">Coupon Code</Label>
              <Input
                id="code"
                value={formData.influencer_code}
                onChange={(e) => setFormData({ ...formData, influencer_code: e.target.value.toUpperCase() })}
                placeholder="e.g. VEDIC_SUMMER"
                className="rounded-none border-gray-300 focus-visible:ring-gray-400 font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="discount" className="text-xs uppercase tracking-wider text-gray-500">Discount %</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  className="rounded-none border-gray-300 focus-visible:ring-gray-400"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="commission" className="text-xs uppercase tracking-wider text-gray-500">Commission %</Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.commission_percent}
                  onChange={(e) => setFormData({ ...formData, commission_percent: e.target.value })}
                  className="rounded-none border-gray-300 focus-visible:ring-gray-400"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status" className="text-xs uppercase tracking-wider text-gray-500">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger className="rounded-none border-gray-300 focus:ring-gray-400">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-gray-200">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expires" className="text-xs uppercase tracking-wider text-gray-500">Expiry Date (Optional)</Label>
              <Input
                id="expires"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="rounded-none border-gray-300 focus-visible:ring-ring"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
              className="rounded-none border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-none bg-gray-900 text-white hover:bg-gray-800"
            >
              {isSaving ? 'Saving...' : 'Save Influencer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}