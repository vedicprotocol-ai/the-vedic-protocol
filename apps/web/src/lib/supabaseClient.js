import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Returns a public image URL from Supabase Storage or passes through
 * an already-absolute URL stored directly in the record field.
 *
 * Usage: getImageUrl(product.image)
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const { data } = supabase.storage.from('images').getPublicUrl(imagePath);
  return data?.publicUrl ?? null;
};

export default supabase;
export { supabase };
