import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
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
    expires_at: '',
    status: 'active'
  });

  const { toast } = useToast();

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
        expires_at: influencer.coupon?.valid_until ? influencer.coupon.valid_until.split('T')[0] : '',
        status: influencer.status || 'active'
      });
    } else {
      setEditingId(null);
      setFormData({
        customer_email: '',
        influencer_code: '',
        discount_percentage: 10,
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
          status: formData.status,
          total_earnings: 0,
          vedic_points: 0,
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
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">Validity</TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">Status</TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      Loading influencers...
                    </TableCell>
                  </TableRow>
                ) : filteredInfluencers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
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
                      <TableCell className="text-gray-600 text-sm">
                        {inf.coupon?.valid_until
                          ? new Date(inf.coupon.valid_until).toLocaleDateString()
                          : 'No Expiry'}
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