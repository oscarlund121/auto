// import { Configuration, OpenAIApi } from "openai";
import { createClient } from "@supabase/supabase-js";

// OpenAI REST API helper
async function fetchOpenAIChat(prompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error("OpenAI chat fejl");
  const data = await res.json();
  return data.choices[0].message.content;
}

async function fetchOpenAIImage(prompt) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size: "1024x1024",
    }),
  });
  if (!res.ok) throw new Error("OpenAI image fejl");
  const data = await res.json();
  return data.data[0].url;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Kun POST tilladt" });
  }
  try {
    // Hent alle profiler
    const { data: profiles, error } = await supabase.from("users").select("email, company");
    if (error) {
      console.error("Supabase users error:", error);
      throw error;
    }
    let results = [];
    for (const profile of profiles) {
      try {
        // Generér tekst
        const content = await fetchOpenAIChat(`Lav et SoMe opslag for ${profile.company}`);
        // Generér billede
        const image_url = await fetchOpenAIImage(`Billede til SoMe opslag for ${profile.company}`);
        // Gem post
        const { data: post, error: postError } = await supabase.from("posts").insert({
          user_email: profile.email,
          content,
          image_url,
        });
        if (postError) {
          console.error("Supabase posts error:", postError);
        }
        results.push({ email: profile.email, post, error: postError });
      } catch (profileErr) {
        console.error(`Fejl for profil ${profile.email}:`, profileErr);
        results.push({ email: profile.email, error: profileErr.message });
      }
    }
    res.status(200).json({ results });
  } catch (err) {
    console.error("Auto-generate-posts API fejl:", err);
    res.status(500).json({ error: err.message });
  }
}
