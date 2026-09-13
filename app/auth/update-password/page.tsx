"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage('❌ Invalid or expired link. Please request a new password reset.');
      }
    };
    checkSession();
  }, []);

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('❌ Passwords do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('❌ Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage('❌ Error: ' + error.message);
    } else {
      setMessage('✅ Password updated successfully! Redirecting to login...');
      setTimeout(() => router.push('/auth/admin-login'), 2000);
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
    <main style={{ padding: '40px 20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <img src="/logo.png" alt="OKcharge" style={{ height: '50px', marginBottom: '20px' }} />
        <h1 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '10px' }}>Set New Password</h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Please choose a strong new password.</p>
      </div>

      {message && (
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: message.includes('✅') ? '#dcfce7' : '#fee2e2',
          color: message.includes('✅') ? '#15803d' : '#b91c1c',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleUpdate}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>New Password</label>
        <input
          style={inputStyle}
          type="password"
          placeholder="At least 6 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Confirm New Password</label>
        <input
          style={inputStyle}
          type="password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </main>
  );
}
