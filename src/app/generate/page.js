"use client";

import { useEffect, useState } from "react";

export default function GeneratePage() {
  const [posts, setPosts] = useState([]);
  const [publications, setPublications] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const postsRes = await fetch("/api/posts");
      const postsData = await postsRes.json();
      setPosts(postsData.posts || []);
      const pubsRes = await fetch("/api/publications");
      const pubsData = await pubsRes.json();
      setPublications(pubsData.publications || []);
      const metricsRes = await fetch("/api/post-metrics");
      const metricsData = await metricsRes.json();
      setMetrics(metricsData.metrics || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  function getPublication(postId, platform) {
    return publications.find(p => p.post_id === postId && p.platform === platform);
  }
  function getMetrics(postId, platform) {
    return metrics.find(m => m.post_id === postId && m.platform === platform);
  }

  if (loading) return <div>Indlæser...</div>;

  return (
    <div>
      <h1>Automatisk indholdsgenerering</h1>
      <table>
        <thead>
          <tr>
            <th>Post</th>
            <th>Platform</th>
            <th>Status</th>
            <th>Performance</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => ["facebook", "instagram", "linkedin"].map(platform => {
            const pub = getPublication(post.id, platform);
            const met = getMetrics(post.id, platform);
            return (
              <tr key={post.id + platform}>
                <td>{post.content?.slice(0, 60)}...</td>
                <td>{platform}</td>
                <td>{pub ? pub.status : "-"}</td>
                <td>
                  {met ? JSON.stringify(met.metrics) : "-"}
                </td>
              </tr>
            );
          }))}
        </tbody>
      </table>
    </div>
  );
}
