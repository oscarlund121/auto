import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Hent metrics fra Instagram Graph API for et givent mediaId (Instagram post ID)
async function fetchInstagramPostMetrics(igAccessToken, igMediaId) {
  // Felter: like_count, comments_count, impressions, reach, saved
  const fields = [
    "like_count",
    "comments_count",
    "impressions",
    "reach",
    "saved"
  ].join(",");
  const url = `https://graph.facebook.com/v19.0/${igMediaId}?fields=${fields}&access_token=${igAccessToken}`;
  const res = await fetch(url);
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Kun POST tilladt" });
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ error: "postId mangler" });

  // Find Instagram mediaId og brugerens token fra Supabase
  const { data: publication, error: pubError } = await supabase.from("publications").select("*", { count: "exact" }).eq("post_id", postId).eq("platform", "instagram").single();
  if (pubError || !publication) return res.status(404).json({ error: "Instagram-publication ikke fundet" });
  const igMediaId = JSON.parse(publication.response).id;
  if (!igMediaId) return res.status(400).json({ error: "Instagram media ID mangler" });

  // Find brugerens Instagram-token
  const { data: post, error: postError } = await supabase.from("posts").select("*", { count: "exact" }).eq("id", postId).single();
  if (postError || !post) return res.status(404).json({ error: "Post ikke fundet" });
  const { data: user, error: userError } = await supabase.from("users").select("instagram_token").eq("email", post.user_email).single();
  if (userError || !user || !user.instagram_token) return res.status(400).json({ error: "Instagram-token mangler" });

  // Hent metrics fra Instagram
  try {
    const metrics = await fetchInstagramPostMetrics(user.instagram_token, igMediaId);
    // Gem metrics i post_metrics
    await supabase.from("post_metrics").upsert({
      post_id: postId,
      platform: "instagram",
      metrics: metrics,
      updated_at: new Date().toISOString(),
    });
    res.status(200).json({ metrics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
