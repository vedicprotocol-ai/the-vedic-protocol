import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { useToast } from '@/hooks/use-toast.js';
import supabase from '@/lib/supabaseClient.js';

const JoinProtocolForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiry_type: 'other',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Validation Error",
        description: "Name, email, and message are required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('contact_submissions').insert(formData);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Thank you! We'll be in touch soon."
      });
      setFormData({ name: '', email: '', inquiry_type: 'other', message: '' });
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-[#1a1a1a] border border-border p-8 md:p-12 max-w-2xl mx-auto w-full"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif text-white mb-4">Join The Protocol</h2>
        <p className="text-white/70 text-sm leading-relaxed">
          Register for exclusive access to clinical formulations, early product releases, and advanced Ayurvedic research.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="signup-name" className="text-xs uppercase tracking-widest text-primary">Full Name *</Label>
          <Input 
            id="signup-name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            className="bg-black/50 border-border rounded-none h-12 focus-visible:ring-primary text-white placeholder:text-white/30"
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-xs uppercase tracking-widest text-primary">Email Address *</Label>
          <Input 
            id="signup-email" 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange}
            className="bg-black/50 border-border rounded-none h-12 focus-visible:ring-primary text-white placeholder:text-white/30"
            placeholder="Enter your email address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-inquiry-type" className="text-xs uppercase tracking-widest text-primary">Inquiry Type</Label>
          <select 
            id="signup-inquiry-type" 
            name="inquiry_type" 
            value={formData.inquiry_type} 
            onChange={handleChange}
            className="flex h-12 w-full bg-black/50 border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 rounded-none text-white"
          >
            <option value="product_question">Product Question</option>
            <option value="partnership">Partnership</option>
            <option value="feedback">Feedback</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-message" className="text-xs uppercase tracking-widest text-primary">Message *</Label>
          <Textarea 
            id="signup-message" 
            name="message" 
            value={formData.message} 
            onChange={handleChange} 
            rows={4}
            className="bg-black/50 border-border rounded-none resize-none focus-visible:ring-primary text-white placeholder:text-white/30"
            placeholder="Tell us about your skin barrier concerns..."
            required
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 rounded-none text-sm uppercase tracking-widest mt-4 transition-all duration-300"
        >
          {loading ? 'Processing...' : 'Request Access'}
        </Button>
      </form>
    </motion.div>
  );
};

export default JoinProtocolForm;