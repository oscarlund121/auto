import React, { useState } from "react";
import Button from "../../components/Button";

export default function TriggerAutoGenerateButton({ onDone }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleClick() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/auto-generate-posts", { method: "POST" });
      const data = await res.json();
      setResult(data);
      if (onDone) onDone();
    } catch (err) {
      setResult({ error: "Fejl ved auto-generering" });
    }
    setLoading(false);
  }

  return (
    <div className="my-4">
      <Button type="button" onClick={handleClick} disabled={loading}>
        {loading ? "Genererer automatisk..." : "Kør automatisk AI-generering"}
      </Button>
      {result && (
        <div className="mt-2 text-sm text-gray-600">
          {result.error ? result.error : "Auto-generering udført!"}
        </div>
      )}
    </div>
  );
}
