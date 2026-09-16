"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Get user's role from profile
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      // Redirect based on role
      if (profile?.role === 'staff') {
        router.push('/staff/dashboard');
      } else if (profile?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/owner/dashboard');
      }
    }
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '50px auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Login to OKcharge</h1>
      
      <form onSubmit={handleLogin} style={{ display: 'grid', gap: '15px' }}>
        <input 
          type="email" 
          placeholder="Email Address" 
          required 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          style={inputStyle} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          required 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          style={inputStyle} 
        />
        
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {error && (
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'red' }}>
          {error}
        </p>
      )}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <a href="/auth/staff-register" style={{ color: '#2563eb', fontSize: '14px' }}>Create Staff Account</a>
      </div>
      <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Other login options:</p>
  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
    <a href="/auth/admin-login" style={{ color: '#7c3aed', fontSize: '13px' }}>Admin Login</a>
    <span style={{ color: '#cbd5e1' }}>•</span>
    <a href="/auth/staff-register" style={{ color: '#2563eb', fontSize: '13px' }}>Staff Registration</a>
  </div>
</div>
    </main>
  );
}

const inputStyle = { padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };
const btnStyle = { padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
