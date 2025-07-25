import Nav from '../../components/Nav';

export default function SettingsPage() {
  return (
    <main>
      <Nav />
      <section className="p-8">
        <h2 className="text-2xl font-bold mb-4">Indstillinger</h2>
        <p>Her kan du ændre dine indstillinger.</p>
      </section>
    </main>
  );
}