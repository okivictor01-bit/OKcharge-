"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Redirect to the owner dashboard upon successful login
      router.push('/owner/dashboard');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '15px',
    marginBottom: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box' as const
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', marginTop: '50px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '10px', textAlign: 'center' }}>Partner Login</h1>
      <p style={{ color: '#64748b', marginBottom: '30px', textAlign: 'center' }}>Access your OKcharge dashboard</p>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Email Address</label>
        <input
          style={inputStyle}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Password</label>
        <input
          style={inputStyle}
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading ? '#999' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '14px' }}>
        <p style={{ color: '#64748b' }}>New partner?</p>
        <a href="/auth/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>
          Create an Account
        </a>
      </div>
    </main>
  );
}
