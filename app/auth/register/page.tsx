"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. If Auth is successful, save their business details
    if (authData.user) {
      const { error: dbError } = await supabase
        .from('location_owners')
        .insert([
          {
            user_id: authData.user.id,
            business_name: businessName,
            phone: phone,
            revenue_share_percentage: 30 // Default 30% for the owner
          }
        ]);

      if (dbError) {
        setError('Account created, but failed to save business details: ' + dbError.message);
      } else {
        setSuccess('Registration successful! Please login.');
        setTimeout(() => router.push('/auth/login'), 2000);
      }
    }
    setLoading(false);
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
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', marginTop: '30px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '10px', textAlign: 'center' }}>Partner Registration</h1>
      <p style={{ color: '#64748b', marginBottom: '30px', textAlign: 'center' }}>Join OKcharge and start earning</p>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: '15px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleRegister}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Business Name *</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g., J&D Babies Store"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Phone Number *</label>
        <input
          style={inputStyle}
          type="tel"
          placeholder="e.g., 08012345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Email Address *</label>
        <input
          style={inputStyle}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Password *</label>
        <input
          style={inputStyle}
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading ? '#999' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Creating Account...' : 'Register Business'}
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '14px' }}>
        <p style={{ color: '#64748b' }}>Already have an account?</p>
        <a href="/auth/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>
          Login Here
        </a>
      </div>
    </main>
  );
}
