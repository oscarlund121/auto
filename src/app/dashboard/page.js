
"use client";
import React from 'react';
import Nav from '../../components/Nav';
import FormField from '../../components/FormField';
import Button from '../../components/Button';
import { getAllProfiles, getPostsByUser } from '../../api/supabase';


export default function DashboardPage() {
  const [profiles, setProfiles] = React.useState([]);
  const [selectedEmail, setSelectedEmail] = React.useState("");
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    getAllProfiles().then(setProfiles);
  }, []);

  React.useEffect(() => {
    if (selectedEmail) {
      setLoading(true);
      getPostsByUser(selectedEmail).then(res => {
        setPosts(res);
        setLoading(false);
      });
    } else {
      setPosts([]);
    }
  }, [selectedEmail]);

  return (
    <main>
      <Nav />
      <section className="p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <div className="mb-4">
          <label className="block font-medium mb-1">Vælg profil</label>
          <select onChange={e => setSelectedEmail(e.target.value)} className="border rounded px-2 py-1 w-full" value={selectedEmail}>
            <option value="">-- Vælg profil --</option>
            {profiles.map(p => (
              <option key={p.email} value={p.email}>{p.company} ({p.email})</option>
            ))}
          </select>
        </div>
        {loading && <div className="mb-4 text-gray-500">Indlæser posts...</div>}
        {selectedEmail && posts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">Posts for profil</h3>
            <ul className="space-y-4">
              {posts.map(post => (
                <li key={post.id} className="border rounded p-2">
                  <div className="mb-1 text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</div>
                  <div className="mb-2">{post.content}</div>
                  {post.image_url && <img src={post.image_url} alt="Post billede" className="w-32 h-32 object-contain" />}
                </li>
              ))}
            </ul>
          </div>
        )}
        {selectedEmail && posts.length === 0 && !loading && (
          <div className="mt-8 text-gray-500">Ingen posts for denne profil.</div>
        )}
      </section>
    </main>
  );
}
