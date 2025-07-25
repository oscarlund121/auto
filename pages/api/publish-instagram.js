import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function publishToInstagram(instagramToken, instagramBusinessId, caption, imageUrl) {
  // 1. Opret mediecontainer
  const mediaRes = await fetch(
    `https://graph.facebook.com/v19.0/${instagramBusinessId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: instagramToken,
      }),
    }
  );
  const mediaData = await mediaRes.json();
  if (!mediaData.id) throw new Error("Instagram media fejl: " + JSON.stringify(mediaData));
  // 2. Publicér medie
  const publishRes = await fetch(
    `https://graph.facebook.com/v19.0/${instagramBusinessId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: mediaData.id, access_token: instagramToken }),
    }
  );
  const publishData = await publishRes.json();
  return publishData;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Kun POST tilladt" });
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ error: "postId mangler" });

  // Hent post og brugerens Instagram-token/businessId fra Supabase
  const { data: post, error: postError } = await supabase.from("posts").select("*").eq("id", postId).single();
  if (postError || !post) return res.status(404).json({ error: "Post ikke fundet" });
  const { data: user, error: userError } = await supabase.from("users").select("instagram_token, instagram_business_id").eq("email", post.user_email).single();
  if (userError || !user || !user.instagram_token || !user.instagram_business_id) return res.status(400).json({ error: "Instagram-token eller business_id mangler" });

  // Publicér til Instagram
  try {
    const igRes = await publishToInstagram(user.instagram_token, user.instagram_business_id, post.content, post.image_url);
    // Gem publiceringsstatus i 'publications'
    await supabase.from("publications").insert({
      post_id: postId,
      platform: "instagram",
      status: igRes.id ? "success" : "error",
      response: JSON.stringify(igRes),
    });
    res.status(200).json({ igRes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
