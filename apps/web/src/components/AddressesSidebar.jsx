import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import AddressForm from './AddressForm.jsx';
import { Loader2, Plus, Edit2, Trash2, MapPin } from 'lucide-react';

export default function AddressesSidebar() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const fetchAddresses = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('customer_address')
        .select('*')
        .eq('customer_id', currentUser.id)
        .order('created', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast({
        title: 'Error loading addresses',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [currentUser]);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (!currentUser) return;
    setIsSaving(true);

    try {
      if (editingAddress) {
        // Update
        const { error } = await supabase
          .from('customer_address')
          .update(formData)
          .eq('id', editingAddress.id);

        if (error) throw error;
        toast({ title: 'Address updated successfully' });
      } else {
        // Create
        const { error } = await supabase
          .from('customer_address')
          .insert([{ ...formData, customer_id: currentUser.id }]);

        if (error) throw error;
        toast({ title: 'Address added successfully' });
      }

      setIsFormOpen(false);
      fetchAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: 'Error saving address',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('customer_address')
        .delete()
        .eq('id', addressToDelete.id);

      if (error) throw error;
      toast({ title: 'Address deleted successfully' });
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: 'Error deleting address',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setAddressToDelete(null);
    }
  };

  return (
    <div className="bg-[var(--off)] border border-[var(--line)] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-serif text-[18px] font-normal text-[var(--ink)]">Saved Addresses</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenAdd}
          className="h-8 px-3 text-xs border-[var(--line-dk)] hover:bg-[var(--stone)]"
        >
          <Plus className="w-3 h-3 mr-1" /> Add New
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--gold)]" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[var(--line)] rounded-xl bg-white/50">
          <MapPin className="w-8 h-8 mx-auto text-[var(--ink-4)] mb-3 opacity-50" />
          <p className="text-[13px] text-[var(--ink-3)] mb-4">No addresses saved yet.</p>
          <Button
            variant="link"
            onClick={handleOpenAdd}
            className="text-[12px] text-[var(--ink)] h-auto p-0"
          >
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="group bg-white border border-[var(--line)] rounded-xl p-4 transition-all hover:shadow-sm hover:border-[var(--line-dk)]"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-[13px] text-[var(--ink)] font-medium mb-1 leading-snug">
                    {addr.address}
                  </p>
                  <p className="text-[12px] text-[var(--ink-3)] leading-relaxed">
                    {addr.city}, {addr.state} {addr.zip}<br />
                    {addr.country}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--off)]"
                    onClick={() => handleOpenEdit(addr)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setAddressToDelete(addr)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-normal text-[var(--ink)]">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>
          <AddressForm
            initialData={editingAddress}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={isSaving}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!addressToDelete} onOpenChange={(open) => !open && setAddressToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}