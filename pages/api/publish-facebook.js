import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function publishToFacebook(pageAccessToken, pageId, message, imageUrl) {
  // 1. Upload billede til Facebook (valgfrit, hvis du vil have billede med)
  let photoId = null;
  if (imageUrl) {
    const photoRes = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/photos`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imageUrl, published: false, access_token: pageAccessToken }),
      }
    );
    const photoData = await photoRes.json();
    if (photoData.id) photoId = photoData.id;
  }
  // 2. Opret post med tekst og evt. billede
  const postRes = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/feed`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        ...(photoId ? { object_attachment: photoId } : {}),
        access_token: pageAccessToken,
      }),
    }
  );
  const postData = await postRes.json();
  return postData;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Kun POST tilladt" });
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ error: "postId mangler" });

  // Hent post og brugerens Facebook-token/pageId fra Supabase
  const { data: post, error: postError } = await supabase.from("posts").select("*", { count: "exact" }).eq("id", postId).single();
  if (postError || !post) return res.status(404).json({ error: "Post ikke fundet" });
  const { data: user, error: userError } = await supabase.from("users").select("facebook_token, facebook_page_id").eq("email", post.user_email).single();
  if (userError || !user || !user.facebook_token || !user.facebook_page_id) return res.status(400).json({ error: "Facebook-token eller pageId mangler" });

  // Publicér til Facebook
  try {
    const fbRes = await publishToFacebook(user.facebook_token, user.facebook_page_id, post.content, post.image_url);
    // Gem publiceringsstatus i ny tabel 'publications'
    await supabase.from("publications").insert({
      post_id: postId,
      platform: "facebook",
      status: fbRes.id ? "success" : "error",
      response: JSON.stringify(fbRes),
    });
    res.status(200).json({ fbRes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
