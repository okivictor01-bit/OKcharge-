"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function StaffLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', data.user.id)
        .eq('is_active', true)
        .single();

      if (!staffData) {
        await supabase.auth.signOut();
        setError('Access denied. This account does not have staff privileges.');
        setLoading(false);
        return;
      }

      if (staffData.must_change_password) {
        router.push('/staff/change-password');
      } else {
        router.push('/staff/dashboard');
      }
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '15px',
    marginBottom: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box'
  };

  return (
    <main style={{ padding: '40px 20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔐</div>
        <h1 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '10px' }}>Staff Access</h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Authorized OKcharge personnel only</p>
      </div>

      {error && (
        <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '14px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Email Address</label>
        <input style={inputStyle} type="email" placeholder="staff@okcharge.ng" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Password</label>
        <input style={inputStyle} type="password" placeholder="Enter your password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', backgroundColor: loading ? '#999' : '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </main>
  );
}
