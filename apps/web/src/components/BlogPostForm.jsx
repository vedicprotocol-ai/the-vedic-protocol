
import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useToast } from '@/hooks/use-toast.js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export default function BlogPostForm({ post, onSuccess, onCancel }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [slugError, setSlugError] = useState('');
  
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    type: post?.type || 'journal',
    category: post?.category || 'skincare',
    excerpt: post?.excerpt || '',
    body: post?.body || '',
    read_time: post?.read_time || 5,
    image_url: post?.image_url || '',
    published: post?.published || false,
  });

  // Auto-generate slug for new posts if slug hasn't been manually edited
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData((prev) => {
      const isSlugUnmodified = !post && prev.slug === generateSlug(prev.title);
      const newSlug = isSlugUnmodified ? generateSlug(newTitle) : prev.slug;
      if (isSlugUnmodified) setSlugError('');
      return {
        ...prev,
        title: newTitle,
        slug: newSlug,
      };
    });
  };

  const handleChange = (field, value) => {
    if (field === 'slug') setSlugError('');
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSlugError('');
    
    if (!formData.title || !formData.slug) {
      toast({
        title: 'Validation Error',
        description: 'Title and Slug are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (post?.id) {
        await pb.collection('blog_posts').update(post.id, formData, { $autoCancel: false });
        toast({ title: 'Post updated successfully.' });
      } else {
        await pb.collection('blog_posts').create(formData, { $autoCancel: false });
        toast({ title: 'Post created successfully.' });
      }
      onSuccess();
    } catch (error) {
      console.error('Save post error:', error);
      const fieldErrors = error?.response?.data || {};
      
      if (fieldErrors.slug?.code === 'validation_not_unique') {
        const msg = 'A post with this slug already exists. Please edit the slug to make it unique.';
        setSlugError(msg);
        toast({
          title: 'Validation Error',
          description: msg,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error saving post',
          description: error.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-[10px] tracking-[0.1em] uppercase text-[var(--ink-3)]">Title *</Label>
          <Input 
            id="title" 
            value={formData.title} 
            onChange={handleTitleChange} 
            placeholder="Enter post title"
            className="border-[var(--line-dk)] focus-visible:ring-[var(--gold)] rounded-none"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug" className={`text-[10px] tracking-[0.1em] uppercase ${slugError ? 'text-destructive' : 'text-[var(--ink-3)]'}`}>Slug *</Label>
          <Input 
            id="slug" 
            value={formData.slug} 
            onChange={(e) => handleChange('slug', e.target.value)} 
            placeholder="post-url-slug"
            className={`border-[var(--line-dk)] focus-visible:ring-[var(--gold)] rounded-none ${slugError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            required
          />
          {slugError && <p className="text-xs text-destructive mt-1">{slugError}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] tracking-[0.1em] uppercase text-[var(--ink-3)]">Type</Label>
          <Select value={formData.type} onValueChange={(val) => handleChange('type', val)}>
            <SelectTrigger className="border-[var(--line-dk)] focus:ring-[var(--gold)] rounded-none">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="journal">Journal</SelectItem>
              <SelectItem value="research">Research</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] tracking-[0.1em] uppercase text-[var(--ink-3)]">Category</Label>
          <Select value={formData.category} onValueChange={(val) => handleChange('category', val)}>
            <SelectTrigger className="border-[var(--line-dk)] focus:ring-[var(--gold)] rounded-none">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="skincare">Skincare</SelectItem>
              <SelectItem value="haircare">Haircare</SelectItem>
              <SelectItem value="ingredients">Ingredients</SelectItem>
              <SelectItem value="philosophy">Philosophy</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="read_time" className="text-[10px] tracking-[0.1em] uppercase text-[var(--ink-3)]">Read Time (mins)</Label>
          <Input 
            id="read_time" 
            type="number" 
            min="1"
            value={formData.read_time} 
            onChange={(e) => handleChange('read_time', parseInt(e.target.value) || 1)} 
            className="border-[var(--line-dk)] focus-visible:ring-[var(--gold)] rounded-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url" className="text-[10px] tracking-[0.1em] uppercase text-[var(--ink-3)]">Featured Image URL</Label>
        <Input 
          id="image_url" 
          value={formData.image_url} 
          onChange={(e) => handleChange('image_url', e.target.value)} 
          placeholder="https://example.com/image.jpg"
          className="border-[var(--line-dk)] focus-visible:ring-[var(--gold)] rounded-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt" className="text-[10px] tracking-[0.1em] uppercase text-[var(--ink-3)]">Excerpt</Label>
        <Textarea 
          id="excerpt" 
          value={formData.excerpt} 
          onChange={(e) => handleChange('excerpt', e.target.value)} 
          placeholder="Brief summary of the post..."
          className="border-[var(--line-dk)] focus-visible:ring-[var(--gold)] rounded-none resize-none h-20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body" className="text-[10px] tracking-[0.1em] uppercase text-[var(--ink-3)]">Body Content (Markdown supported)</Label>
        <Textarea 
          id="body" 
          value={formData.body} 
          onChange={(e) => handleChange('body', e.target.value)} 
          placeholder="Write your post content here..."
          className="border-[var(--line-dk)] focus-visible:ring-[var(--gold)] rounded-none min-h-[200px]"
        />
      </div>

      <div className="flex items-center space-x-3 pt-2 pb-4 border-t border-[var(--line)]">
        <Switch 
          id="published" 
          checked={formData.published} 
          onCheckedChange={(checked) => handleChange('published', checked)} 
        />
        <Label htmlFor="published" className="text-[13px] text-[var(--ink)] cursor-pointer">
          Publish immediately
        </Label>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-none border-[var(--line-dk)] text-[var(--ink-2)] hover:bg-[var(--stone)] hover:text-[var(--ink)]"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="rounded-none bg-[var(--ink)] text-[var(--white)] hover:bg-[var(--terra)]"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {post ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  );
}
