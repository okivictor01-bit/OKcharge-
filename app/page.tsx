import { createClient } from '@supabase/supabase-js';

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.from('locations').select('name');

  return (
    <main style={{ padding: '20px', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '28px' }}>🔋 OKcharge Platform</h1>
      <p style={{ color: '#666' }}>System Status:</p>

      {error ? (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
          ❌ Database Error: {error.message}
        </div>
      ) : (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
          ✅ Connected to Supabase successfully!<br />
          Found {data?.length || 0} locations in database.
        </div>
      )}
    </main>
  );
}
