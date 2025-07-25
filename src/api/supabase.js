// Opret et nyt post
export async function createPost({ user_email, content, image_url }) {
  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_email, content, image_url })
  });
  if (!res.ok) throw new Error('Failed to create post');
  const { data } = await res.json();
  return data;
}

// Hent alle posts for en bruger
export async function getPostsByUser(user_email) {
  const res = await fetch('/api/posts');
  if (!res.ok) return [];
  const { data } = await res.json();
  // Filter client-side for user_email (or make a custom API route if needed)
  return data.filter(post => post.user_email === user_email);
}
// Hent alle profiler
export async function getAllProfiles() {
  const res = await fetch('/api/profiles');
  if (!res.ok) return [];
  const { data } = await res.json();
  return data;
}
import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are available at build and runtime
// Fetch all posts (for compatibility)
export async function fetchPostsFromApi() {
  const res = await fetch('/api/posts');
  if (!res.ok) throw new Error('Failed to fetch data');
  const { data } = await res.json();
  return data;
}

// Gem eller opdater brugerprofil
export async function saveUserProfile({ email, name, company, facebook_token, instagram_token, linkedin_token }) {
  const res = await fetch('/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, company, facebook_token, instagram_token, linkedin_token })
  });
  if (!res.ok) throw new Error('Failed to save profile');
  const { data } = await res.json();
  return data;
}

// Hent brugerprofil ud fra email
export async function getUserProfile(email) {
  const res = await fetch('/api/profiles');
  if (!res.ok) return null;
  const { data } = await res.json();
  return data.find(profile => profile.email === email) || null;
}
