"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function StaffDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login'); // Redirect if not logged in
      } else {
        // Check if they are actually staff
        const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
        if (profile?.role !== 'staff' && profile?.role !== 'admin') {
           router.push('/owner/dashboard'); // Redirect owners away
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) return <div style={{padding: '20px'}}>Loading...</div>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Staff Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        <a href="/admin/owners" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>👥</div>
            <h2 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Manage Owners</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Approve, suspend, or delete location owners.</p>
          </div>
        </a>

        <a href="/admin/generate-qr" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📱</div>
            <h2 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Generate QR Codes</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Create codes for new locations and power banks.</p>
          </div>
        </a>
      </div>
    </main>
  );
}
