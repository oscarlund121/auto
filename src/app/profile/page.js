"use client";
import React from 'react';
import Nav from '../../components/Nav';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import { useState } from 'react';
import { saveUserProfile, getUserProfile, getAllProfiles } from '../../api/supabase';

export default function ProfilePage() {
  const [form, setForm] = useState({ name: '', email: '', company: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState([]);
  // Hent alle profiler ved load
  React.useEffect(() => {
    getAllProfiles().then(setProfiles);
  }, []);
  function handleSelectProfile(e) {
    const selected = profiles.find(p => p.email === e.target.value);
    if (selected) setForm(selected);
  }

  async function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSubmitted(false);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await saveUserProfile(form);
      setSubmitted(true);
    } catch (err) {
      setError("Kunne ikke gemme profil");
    }
    setLoading(false);
  }

  async function handleFetch() {
    setLoading(true);
    setError("");
    try {
      const data = await getUserProfile(form.email);
      if (data) setForm(data);
      else setError("Ingen profil fundet på denne email");
    } catch (err) {
      setError("Fejl ved hentning af profil");
    }
    setLoading(false);
  }

  return (
    <main>
      <Nav />
      <section className="p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Profiloprettelse</h2>
        <div className="mb-4">
          <label className="block font-medium mb-1">Vælg profil</label>
          <select onChange={handleSelectProfile} className="border rounded px-2 py-1 w-full" value={form.email || ''}>
            <option value="">-- Vælg eksisterende profil --</option>
            {profiles.map(p => (
              <option key={p.email} value={p.email}>{p.company} ({p.email})</option>
            ))}
          </select>
        </div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <FormField label="Virksomhedsnavn">
            <input name="company" value={form.company} onChange={handleChange} className="border rounded px-2 py-1 w-full" required />
          </FormField>
          <FormField label="Navn">
            <input name="name" value={form.name} onChange={handleChange} className="border rounded px-2 py-1 w-full" required />
          </FormField>
          <FormField label="Email">
            <input name="email" type="email" value={form.email} onChange={handleChange} className="border rounded px-2 py-1 w-full" required />
          </FormField>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>Gem profil</Button>
            <Button type="button" onClick={handleFetch} disabled={loading || !form.email}>Hent profil</Button>
          </div>
        </form>
        {submitted && <div className="mt-4 text-green-600">Profil gemt!</div>}
        {error && <div className="mt-4 text-red-600">{error}</div>}
      </section>
    </main>
  );
}
