import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function publishToLinkedIn(accessToken, authorUrn, message, imageUrl) {
  // 1. (Optional) Upload image to LinkedIn and get asset ID
  let imageAsset = null;
  if (imageUrl) {
    // Register upload
    const registerRes = await fetch(
      "https://api.linkedin.com/v2/assets?action=registerUpload",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          registerUploadRequest: {
            owner: authorUrn,
            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
            serviceRelationships: [
              {
                identifier: "urn:li:userGeneratedContent",
                relationshipType: "OWNER",
              },
            ],
          },
        }),
      }
    );
    const registerData = await registerRes.json();
    const uploadUrl = registerData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
    const asset = registerData.value.asset;
    // Upload image binary
    const imageRes = await fetch(imageUrl);
    const imageBlob = await imageRes.blob();
    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
      body: imageBlob,
    });
    imageAsset = asset;
  }
  // 2. Create post
  const postBody = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: message },
        shareMediaCategory: imageAsset ? "IMAGE" : "NONE",
        ...(imageAsset
          ? {
              media: [
                {
                  status: "READY",
                  media: imageAsset,
                },
              ],
            }
          : {}),
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };
  const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(postBody),
  });
  const postData = await postRes.json();
  return postData;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Kun POST tilladt" });
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ error: "postId mangler" });

  // Hent post og brugerens LinkedIn-token/urn fra Supabase
  const { data: post, error: postError } = await supabase.from("posts").select("*", { count: "exact" }).eq("id", postId).single();
  if (postError || !post) return res.status(404).json({ error: "Post ikke fundet" });
  const { data: user, error: userError } = await supabase.from("users").select("linkedin_token, linkedin_urn").eq("email", post.user_email).single();
  if (userError || !user || !user.linkedin_token || !user.linkedin_urn) return res.status(400).json({ error: "LinkedIn-token eller URN mangler" });

  // Publicér til LinkedIn
  try {
    const liRes = await publishToLinkedIn(user.linkedin_token, user.linkedin_urn, post.content, post.image_url);
    // Gem publiceringsstatus i 'publications'
    await supabase.from("publications").insert({
      post_id: postId,
      platform: "linkedin",
      status: liRes.id ? "success" : "error",
      response: JSON.stringify(liRes),
    });
    res.status(200).json({ liRes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
