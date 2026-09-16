"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
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

    // Check if user is admin
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (profile?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        setError('Access denied. Admin only.');
        await supabase.auth.signOut();
      }
    }
    setLoading(false);
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '50px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Admin Login</h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Authorized personnel only</p>
      </div>
      
      <form onSubmit={handleLogin} style={{ display: 'grid', gap: '15px' }}>
        <input 
          type="email" 
          placeholder="Admin Email" 
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
          {loading ? 'Logging in...' : 'Login as Admin'}
        </button>
      </form>

      {error && (
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#ef4444' }}>
          {error}
        </p>
      )}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <a href="/auth/login" style={{ color: '#2563eb', fontSize: '14px' }}>Back to General Login</a>
      </div>
    </main>
  );
}

const inputStyle = { padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };
const btnStyle = { padding: '12px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
