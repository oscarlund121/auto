// Opret et nyt post
export async function createPost({ user_email, content, image_url }) {
  const { data, error } = await supabase
    .from('posts')
    .insert([{ user_email, content, image_url }]);
  if (error) throw error;
  return data;
}

// Hent alle posts for en bruger
export async function getPostsByUser(user_email) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_email', user_email)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}
// Hent alle profiler
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  if (error) return [];
  return data;
}
import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are available at build and runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required.');
}
if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Gem eller opdater brugerprofil
export async function saveUserProfile({ email, name, company, facebook_token, instagram_token, linkedin_token }) {
  // Upsert: indsæt eller opdater hvis email findes
  const { data, error } = await supabase
    .from('users')
    .upsert([
      { email, name, company, facebook_token, instagram_token, linkedin_token }
    ], { onConflict: ['email'] });
  if (error) throw error;
  return data;
}

// Hent brugerprofil ud fra email
export async function getUserProfile(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (error) return null;
  return data;
}
