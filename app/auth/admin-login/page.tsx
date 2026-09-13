"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      router.push('/admin/dashboard');
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
        <img src="/logo.png" alt="OKcharge" style={{ height: '50px', marginBottom: '20px' }} />
        <h1 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '10px' }}>Admin Login</h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Sign in to access the admin dashboard</p>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          fontSize: '14px',
          textAlign: 'center'
        }}>
           {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Email Address</label>
        <input
          style={inputStyle}
          type="email"
          placeholder="admin@okcharge.ng"
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
            backgroundColor: loading ? '#999' : '#0f172a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <a href="/auth/forgot-password" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px' }}>Forgot Password?</a>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>← Back to Home</Link>
      </div>
    </main>
  );
}
