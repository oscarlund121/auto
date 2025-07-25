import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function publishFacebook(postId) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/publish-facebook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId }),
  });
  return res.json();
}

// TODO: Implementér publishInstagram(postId) når API-route er klar
async function publishInstagram(postId) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/publish-instagram`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId }),
  });
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Kun POST tilladt" });
  const now = new Date().toISOString();
  // Find alle planlagte jobs der skal publiceres nu
  const { data: jobs, error } = await supabase
    .from("scheduled_posts")
    .select("*")
    .lte("scheduled_time", now)
    .eq("status", "pending");
  if (error) return res.status(500).json({ error: error.message });
  if (!jobs || jobs.length === 0) return res.status(200).json({ message: "Ingen jobs klar til publicering" });

  const results = [];
  for (const job of jobs) {
    let publishResult = null;
    let newStatus = "success";
    try {
      if (job.platform === "facebook") {
        publishResult = await publishFacebook(job.post_id);
      } else if (job.platform === "instagram") {
        publishResult = await publishInstagram(job.post_id);
      } else {
        publishResult = { error: "Ukendt platform" };
        newStatus = "error";
      }
      if (publishResult.error) newStatus = "error";
    } catch (err) {
      publishResult = { error: err.message };
      newStatus = "error";
    }
    // Opdater job-status
    await supabase.from("scheduled_posts").update({ status: newStatus, last_response: JSON.stringify(publishResult) }).eq("id", job.id);
    results.push({ jobId: job.id, status: newStatus, response: publishResult });
  }
  res.status(200).json({ results });
}
