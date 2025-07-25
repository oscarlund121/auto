import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Hent metrics fra Facebook Graph API for et givent postId (Facebook post ID)
async function fetchFacebookPostMetrics(pageAccessToken, fbPostId) {
  // Felter: likes, reach, comments, shares
  const fields = [
    "insights.metric(post_impressions,post_engaged_users)",
    "likes.summary(true)",
    "comments.summary(true)",
    "shares"
  ].join(",");
  const url = `https://graph.facebook.com/v19.0/${fbPostId}?fields=${fields}&access_token=${pageAccessToken}`;
  const res = await fetch(url);
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Kun POST tilladt" });
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ error: "postId mangler" });

  // Find Facebook postId og brugerens token fra Supabase
  const { data: publication, error: pubError } = await supabase.from("publications").select("*", { count: "exact" }).eq("post_id", postId).eq("platform", "facebook").single();
  if (pubError || !publication) return res.status(404).json({ error: "Facebook-publication ikke fundet" });
  const fbPostId = JSON.parse(publication.response).id;
  if (!fbPostId) return res.status(400).json({ error: "Facebook post ID mangler" });

  // Find brugerens Facebook-token/pageId
  const { data: post, error: postError } = await supabase.from("posts").select("*", { count: "exact" }).eq("id", postId).single();
  if (postError || !post) return res.status(404).json({ error: "Post ikke fundet" });
  const { data: user, error: userError } = await supabase.from("users").select("facebook_token, facebook_page_id").eq("email", post.user_email).single();
  if (userError || !user || !user.facebook_token) return res.status(400).json({ error: "Facebook-token mangler" });

  // Hent metrics fra Facebook
  try {
    const metrics = await fetchFacebookPostMetrics(user.facebook_token, fbPostId);
    // Gem metrics i post_metrics
    await supabase.from("post_metrics").upsert({
      post_id: postId,
      platform: "facebook",
      metrics: metrics,
      updated_at: new Date().toISOString(),
    });
    res.status(200).json({ metrics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
