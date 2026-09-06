"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function StaffDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<any>(null);
  const [scanCode, setScanCode] = useState('');

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/staff-login'); return; }

    const { data: staffData } = await supabase
      .from('staff')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!staffData) { await supabase.auth.signOut(); router.push('/auth/staff-login'); return; }

    setStaff(staffData);
    setLoading(false);
  };

  const handleGoToPB = () => { if (scanCode) window.location.href = `/staff/pb?code=${scanCode}`; };
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/auth/staff-login'); };

  if (loading) return <main style={{ padding: '20px', textAlign: 'center' }}>Loading...</main>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', margin: 0 }}>Staff Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Welcome to the team,</p>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f172a' }}>{staff.full_name}</h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#2563eb', fontWeight: 'bold' }}>🏢 OKcharge Internal Staff</p>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>🔍 Manage Power Bank</h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>Enter a Power Bank code to rent out or return</p>
        <input
          type="text"
          placeholder="e.g., OKAK001"
          value={scanCode}
          onChange={(e) => setScanCode(e.target.value.toUpperCase())}
          style={{ width: '100%', padding: '15px', marginBottom: '15px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '16px', textTransform: 'uppercase', boxSizing: 'border-box' }}
        />
        <button onClick={handleGoToPB} style={{ width: '100%', padding: '15px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          Go to Power Bank
        </button>
      </div>

      <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
        <h3 style={{ marginTop: 0, color: '#1e40af' }}>ℹ️ Quick Help</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#475569', lineHeight: '1.8' }}>
          <li>You have access to manage power banks across all locations.</li>
          <li>Enter a customer's ticket code to rent out a power bank.</li>
          <li>Click "Confirm Return" when a customer returns a power bank.</li>
          <li>Report damaged or lost power banks immediately to Admin.</li>
        </ul>
      </div>
    </main>
  );
}
