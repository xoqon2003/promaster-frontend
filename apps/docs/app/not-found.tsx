import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>404 — Sahifa topilmadi</h1>
      <p>
        <Link href="/">Bosh sahifaga qaytish</Link>
      </p>
    </main>
  );
}
