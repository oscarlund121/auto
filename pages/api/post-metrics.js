import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { data, error } = await supabase.from("post_metrics").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ metrics: data });
}
