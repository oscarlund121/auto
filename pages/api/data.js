import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.DATABASE_URL;
  const supabaseKey = process.env.DATABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Missing Supabase environment variables' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Example: fetch all posts (customize as needed)
  const { data, error } = await supabase
    .from('posts')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ data });
}
