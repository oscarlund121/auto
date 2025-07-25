import Nav from '../components/Nav';

export default function Home() {
  return (
    <main>
      <Nav />
      <section className="p-8">
        <h1 className="text-3xl font-bold mb-4">Fuldt Automatiseret Indholds- og SoMe-platform</h1>
        <p className="mb-6">Velkommen! Klik rundt for at prøve funktionerne.</p>
      </section>
    </main>
  );
}
