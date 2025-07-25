// Client-side: kalder Next.js API routes
export async function generateText(prompt) {
  const res = await fetch("/api/generate-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error("AI fejl");
  const data = await res.json();
  return data.text;
}

export async function generateImage(prompt) {
  const res = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error("AI fejl");
  const data = await res.json();
  return data.imageUrl;
}
