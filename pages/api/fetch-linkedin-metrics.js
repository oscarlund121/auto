import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Hent metrics fra LinkedIn API for et givent post (urn)
async function fetchLinkedInPostMetrics(linkedInToken, shareUrn) {
  // LinkedIn API: Social Actions endpoint
  const url = `https://api.linkedin.com/v2/socialActions/${shareUrn}`;
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${linkedInToken}`,
      "X-Restli-Protocol-Version": "2.0.0"
    }
  });
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Kun POST tilladt" });
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ error: "postId mangler" });

  // Find LinkedIn shareUrn og brugerens token fra Supabase
  const { data: publication, error: pubError } = await supabase.from("publications").select("*", { count: "exact" }).eq("post_id", postId).eq("platform", "linkedin").single();
  if (pubError || !publication) return res.status(404).json({ error: "LinkedIn-publication ikke fundet" });
  const shareUrn = JSON.parse(publication.response).id || JSON.parse(publication.response).urn;
  if (!shareUrn) return res.status(400).json({ error: "LinkedIn share URN mangler" });

  // Find brugerens LinkedIn-token
  const { data: post, error: postError } = await supabase.from("posts").select("*", { count: "exact" }).eq("id", postId).single();
  if (postError || !post) return res.status(404).json({ error: "Post ikke fundet" });
  const { data: user, error: userError } = await supabase.from("users").select("linkedin_token").eq("email", post.user_email).single();
  if (userError || !user || !user.linkedin_token) return res.status(400).json({ error: "LinkedIn-token mangler" });

  // Hent metrics fra LinkedIn
  try {
    const metrics = await fetchLinkedInPostMetrics(user.linkedin_token, shareUrn);
    // Gem metrics i post_metrics
    await supabase.from("post_metrics").upsert({
      post_id: postId,
      platform: "linkedin",
      metrics: metrics,
      updated_at: new Date().toISOString(),
    });
    res.status(200).json({ metrics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
