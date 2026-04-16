import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Plus, Edit2, Trash2, Package } from 'lucide-react';
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

const EMPTY_FORM = {
  name: '',
  description: '',
  detailed_description: '',
  price: '',
  category: 'skincare',
  image_url: '',
  stock: '',
  ingredients: '',
  benefits: '',
  how_to_use: '',
  featured: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const { toast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created', { ascending: false });
      if (error) throw error;
      setProducts(data ?? []);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast({ title: 'Error', description: 'Failed to load products.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        detailed_description: product.detailed_description || '',
        price: product.price ?? '',
        category: product.category || 'skincare',
        image_url: product.image_url || '',
        stock: product.stock ?? '',
        ingredients: product.ingredients || '',
        benefits: product.benefits || '',
        how_to_use: product.how_to_use || '',
        featured: product.featured ?? false,
      });
    } else {
      setEditingId(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const set = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Validation Error', description: 'Product name is required.', variant: 'destructive' });
      return;
    }
    if (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      toast({ title: 'Validation Error', description: 'A valid price is required.', variant: 'destructive' });
      return;
    }
    if (formData.stock === '' || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      toast({ title: 'Validation Error', description: 'A valid stock quantity is required.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        detailed_description: formData.detailed_description.trim(),
        price: Number(formData.price),
        category: formData.category,
        image_url: formData.image_url.trim(),
        stock: Number(formData.stock),
        ingredients: formData.ingredients.trim(),
        benefits: formData.benefits.trim(),
        how_to_use: formData.how_to_use.trim(),
        featured: formData.featured,
      };

      if (editingId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Success', description: 'Product updated successfully.' });
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        toast({ title: 'Success', description: 'Product added successfully.' });
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Save error:', err);
      toast({ title: 'Error', description: err.message || 'Failed to save product.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Product deleted.' });
      fetchProducts();
    } catch (err) {
      console.error('Delete error:', err);
      toast({ title: 'Error', description: err.message || 'Failed to delete product.', variant: 'destructive' });
    }
  };

  const filtered = products.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#fcfbf9] flex flex-col">
      <Helmet>
        <title>Manage Products | Admin | The Vedic Protocol</title>
      </Helmet>

      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 mt-12">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-amber-700 mb-2">Administration</p>
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900">Manage Products</h1>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-gray-900 text-white hover:bg-gray-800 rounded-none px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </div>

        {/* Table card */}
        <div className="bg-white border border-gray-200 shadow-sm mb-8">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 border-gray-200 rounded-none focus-visible:ring-amber-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">Name</TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">Category</TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">Price (₹)</TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">Stock</TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">Featured</TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(p => (
                    <TableRow key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-900 max-w-xs truncate">
                        {p.name}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100 capitalize">
                          {p.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700 font-medium">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          p.stock > 10
                            ? 'bg-green-100 text-green-800'
                            : p.stock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {p.stock} units
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {p.featured ? (
                          <span className="text-amber-700 font-medium text-xs">Yes</span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(p)}
                            className="h-8 px-2 text-gray-600 hover:text-gray-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(p.id, p.name)}
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

      {/* Add / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[640px] rounded-none border-gray-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-gray-900">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label className="text-xs uppercase tracking-wider text-gray-500">Product Name *</Label>
              <Input
                value={formData.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Kumkumadi Face Elixir"
                className="rounded-none border-gray-300 focus-visible:ring-ring"
              />
            </div>

            {/* Category & Price & Stock */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs uppercase tracking-wider text-gray-500">Category *</Label>
                <Select value={formData.category} onValueChange={val => set('category', val)}>
                  <SelectTrigger className="rounded-none border-gray-300 focus:ring-ring">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-gray-200">
                    <SelectItem value="skincare">Skincare</SelectItem>
                    <SelectItem value="haircare">Haircare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs uppercase tracking-wider text-gray-500">Price (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={e => set('price', e.target.value)}
                  placeholder="999"
                  className="rounded-none border-gray-300 focus-visible:ring-ring"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs uppercase tracking-wider text-gray-500">Stock (units) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={e => set('stock', e.target.value)}
                  placeholder="100"
                  className="rounded-none border-gray-300 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="grid gap-2">
              <Label className="text-xs uppercase tracking-wider text-gray-500">Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={e => set('image_url', e.target.value)}
                placeholder="https://..."
                className="rounded-none border-gray-300 focus-visible:ring-ring"
              />
            </div>

            {/* Short Description */}
            <div className="grid gap-2">
              <Label className="text-xs uppercase tracking-wider text-gray-500">Short Description</Label>
              <textarea
                value={formData.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Brief product description shown on listing cards..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-none resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            {/* Detailed Description */}
            <div className="grid gap-2">
              <Label className="text-xs uppercase tracking-wider text-gray-500">Detailed Description</Label>
              <textarea
                value={formData.detailed_description}
                onChange={e => set('detailed_description', e.target.value)}
                placeholder="Full description shown on product detail page..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-none resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            {/* Ingredients / Benefits / How to Use */}
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs uppercase tracking-wider text-gray-500">Ingredients</Label>
                <textarea
                  value={formData.ingredients}
                  onChange={e => set('ingredients', e.target.value)}
                  placeholder="Key ingredients..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-none resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs uppercase tracking-wider text-gray-500">Benefits</Label>
                <textarea
                  value={formData.benefits}
                  onChange={e => set('benefits', e.target.value)}
                  placeholder="Product benefits..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-none resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs uppercase tracking-wider text-gray-500">How to Use</Label>
                <textarea
                  value={formData.how_to_use}
                  onChange={e => set('how_to_use', e.target.value)}
                  placeholder="Usage instructions..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-none resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>

            {/* Featured toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={e => set('featured', e.target.checked)}
                className="w-4 h-4 accent-amber-700"
              />
              <span className="text-sm text-gray-700">Mark as Featured Product</span>
            </label>
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
              {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
