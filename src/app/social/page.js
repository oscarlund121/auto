"use client";
import React from 'react';
import Nav from '../../components/Nav';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import { useState } from 'react';
import { getAllProfiles, getUserProfile, saveUserProfile } from '../../api/supabase';

export default function SocialPage() {
  const [profiles, setProfiles] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [form, setForm] = useState({ facebook_token: '', instagram_token: '', linkedin_token: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  React.useEffect(() => {
    getAllProfiles().then(setProfiles);
  }, []);

  async function handleSelectProfile(e) {
    const email = e.target.value;
    setSelectedEmail(email);
    setMessage("");
    if (email) {
      const data = await getUserProfile(email);
      setForm({
        facebook_token: data?.facebook_token || '',
        instagram_token: data?.instagram_token || '',
        linkedin_token: data?.linkedin_token || '',
      });
    } else {
      setForm({ facebook_token: '', instagram_token: '', linkedin_token: '' });
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await saveUserProfile({ email: selectedEmail, ...form });
      setMessage("Tokens gemt!");
    } catch {
      setMessage("Fejl ved gem!");
    }
    setLoading(false);
  }

  return (
    <main>
      <Nav />
      <section className="p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Tilknyt SoMe-konti</h2>
        <div className="mb-4">
          <label className="block font-medium mb-1">Vælg profil</label>
          <select onChange={handleSelectProfile} className="border rounded px-2 py-1 w-full" value={selectedEmail}>
            <option value="">-- Vælg profil --</option>
            {profiles.map(p => (
              <option key={p.email} value={p.email}>{p.company} ({p.email})</option>
            ))}
          </select>
        </div>
        {selectedEmail && (
          <form onSubmit={handleSubmit} className="space-y-2">
            <FormField label="Facebook Token">
              <input name="facebook_token" value={form.facebook_token} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
            </FormField>
            <FormField label="Instagram Token">
              <input name="instagram_token" value={form.instagram_token} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
            </FormField>
            <FormField label="LinkedIn Token">
              <input name="linkedin_token" value={form.linkedin_token} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
            </FormField>
            <Button type="submit" disabled={loading}>Gem tokens</Button>
          </form>
        )}
        {message && <div className="mt-4 text-green-600">{message}</div>}
      </section>
    </main>
  );
}
