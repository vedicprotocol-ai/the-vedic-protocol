import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function AddressForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zip: initialData?.zip || '',
    country: initialData?.country || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="address">Street Address *</Label>
        <Input
          id="address"
          name="address"
          required
          value={formData.address}
          onChange={handleChange}
          placeholder="123 Main St, Apt 4B"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
            placeholder="Mumbai"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State/Province *</Label>
          <Input
            id="state"
            name="state"
            required
            value={formData.state}
            onChange={handleChange}
            placeholder="Maharashtra"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zip">ZIP / Postal Code *</Label>
          <Input
            id="zip"
            name="zip"
            required
            value={formData.zip}
            onChange={handleChange}
            placeholder="400001"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            name="country"
            required
            value={formData.country}
            onChange={handleChange}
            placeholder="India"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[var(--ink)] text-white hover:bg-[var(--ink)]/90"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData ? 'Save Changes' : 'Add Address'}
        </Button>
      </div>
    </form>
  );
}