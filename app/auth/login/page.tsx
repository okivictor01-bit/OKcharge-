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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('user_id', data.user.id)
        .single();

      if (profileError || !profile) {
        setError('Profile not found. Please contact support.');
        setLoading(false);
        return;
      }

      // Check if account is approved
      if (profile.status !== 'approved') {
        setError('Your account is pending approval. Please wait for admin approval.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (profile.role === 'staff') {
        router.push('/staff/dashboard');
      } else if (profile.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (profile.role === 'owner') {
        router.push('/owner/dashboard');
      } else {
        // Default to owner dashboard
        router.push('/owner/dashboard');
      }
    }
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '50px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Login to OKcharge</h1>
      </div>
      
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
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#ef4444', fontSize: '14px' }}>
          {error}
        </p>
      )}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Don't have an account? <a href="/auth/register" style={{ color: '#2563eb' }}>Register as Partner</a>
        </p>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '10px' }}>
          <a href="/auth/admin-login" style={{ color: '#7c3aed' }}>Admin Login</a>
        </p>
      </div>
    </main>
  );
}

const inputStyle = { padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };
const btnStyle = { padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
