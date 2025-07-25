import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.DATABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all profiles
    const { data, error } = await supabase.from('users').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  }
  if (req.method === 'POST') {
    // Upsert user profile
    const { email, name, company, facebook_token, instagram_token, linkedin_token } = req.body;
    const { data, error } = await supabase.from('users').upsert([
      { email, name, company, facebook_token, instagram_token, linkedin_token }
    ], { onConflict: ['email'] });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ data });
  }
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
