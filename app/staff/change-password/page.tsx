"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/staff-login');
    }
  };

  const handleChangePassword = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('❌ New passwords do not match.');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage('❌ Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      // Update must_change_password flag to false
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('staff')
          .update({ must_change_password: false })
          .eq('user_id', user.id);
      }

      setMessage('✅ Password changed successfully! Redirecting...');
      setTimeout(() => router.push('/staff/dashboard'), 2000);
    } catch (error: any) {
      setMessage('❌ Error: ' + error.message);
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
        <div style={{ fontSize: '48px', marginBottom: '10px' }}></div>
        <h1 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '10px' }}>Change Your Password</h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Please set a new password for your account</p>
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

      <form onSubmit={handleChangePassword}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>New Password *</label>
        <input
          style={inputStyle}
          type="password"
          placeholder="At least 6 characters"
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          required
          minLength={6}
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Confirm New Password *</label>
        <input
          style={inputStyle}
          type="password"
          placeholder="Re-enter new password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
          minLength={6}
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
