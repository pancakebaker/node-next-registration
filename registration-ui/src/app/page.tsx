/**
 * Home page (Server Component).
 *
 * Queries the backend health endpoint and renders a simple status card.
 *
 * - **Endpoint:** `${process.env.NEXT_PUBLIC_API_BASE}/health`
 * - **Caching:** `{ cache: 'no-store' }` to fetch fresh health on every request.
 *
 * @returns JSX markup showing API and DB health.
 *
 * @example
 * // Route: /
 * // Displays "API health: OK | DB: OK" when the backend reports healthy.
 */
export default async function Home() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/health`, { cache: 'no-store' });
  const health = await res.json();

  return (
    <main className="min-h-dvh flex items-center justify-center p-8">
      <div className="rounded-2xl shadow-lg p-8 border">
        <h1 className="text-2xl font-bold mb-2">Registration UI</h1>
        <p className="text-sm opacity-80">
          API health: {health?.ok ? 'OK' : 'Down'} | DB: {health?.db ? 'OK' : 'Down'}
        </p>
      </div>
    </main>
  );
}
