import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="flex gap-4 p-4 border-b">
      <Link href="/">Forside</Link>
      <Link href="/profile">Profil</Link>
      <Link href="/social">Tilknyt SoMe</Link>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/generate">Indholdsgenerering</Link>
      <Link href="/settings">Indstillinger</Link>
    </nav>
  );
}
