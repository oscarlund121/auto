import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Cron/trigger: Kør job-queue og performance-tracking for alle posts/platforme
export default async function handler(req, res) {
  // 1. Kør job-queue-runner (publicering af planlagte posts)
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/job-queue-runner`, { method: "POST" });
  } catch (err) {
    // Log fejl men fortsæt
  }

  // 2. Hent alle posts med publication på facebook, instagram, linkedin
  const { data: publications, error } = await supabase.from("publications").select("post_id, platform");
  if (error) return res.status(500).json({ error: error.message });

  // 3. Kør performance-tracking for alle posts/platforme
  const results = [];
  for (const pub of publications) {
    let apiUrl = null;
    if (pub.platform === "facebook") apiUrl = "/api/fetch-facebook-metrics";
    if (pub.platform === "instagram") apiUrl = "/api/fetch-instagram-metrics";
    if (pub.platform === "linkedin") apiUrl = "/api/fetch-linkedin-metrics";
    if (!apiUrl) continue;
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${apiUrl}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: pub.post_id }) }
      );
      const json = await r.json();
      results.push({ post_id: pub.post_id, platform: pub.platform, metrics: json });
    } catch (err) {
      results.push({ post_id: pub.post_id, platform: pub.platform, error: err.message });
    }
  }
  res.status(200).json({ results });
}
