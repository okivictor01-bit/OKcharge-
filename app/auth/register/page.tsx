"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    business_name: '',
    phone: '',
    email: '',
    password: '',
    bank_name: '',
    account_number: '',
    partner_type: 'standard' 
  });

  const banks = [
    { code: '044', name: 'Access Bank' },
    { code: '058', name: 'GTBank' },
    { code: '011', name: 'First Bank' },
    { code: '033', name: 'UBA' },
    { code: '057', name: 'Zenith Bank' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '032', name: 'Union Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '090267', name: 'Opay' }, 
    { code: '090288', name: 'PalmPay' },
    { code: '50211', name: 'Kuda Bank' }, 
    { code: '082', name: 'Keystone Bank' },
    { code: '050', name: 'Ecobank' },
    { code: '076', name: 'Polaris Bank' },
    { code: '214', name: 'FCMB' },
  ];

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.account_number.length !== 10) {
      setMessage('❌ Account number must be 10 digits.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Save Owner Details to Database
        const { error: dbError } = await supabase
          .from('location_owners')
          .insert([
            {
              user_id: authData.user.id,
              business_name: formData.business_name,
              phone: formData.phone,
              email: formData.email,
              bank_name: formData.bank_name,
              account_number: formData.account_number,
              partner_type: formData.partner_type, 
              revenue_share_percentage: formData.partner_type === 'owner' ? 75 : 40, 
              created_at: new Date().toISOString()
            }
          ]);

        if (dbError) throw dbError;

        setMessage('✅ Registration successful! Please check your email to verify your account.');
        setTimeout(() => router.push('/auth/login'), 3000);
      }
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
    <main style={{ padding: '40px 20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '10px' }}>Partner Registration</h1>
        <p style={{ color: '#64748b' }}>Join OKcharge and start earning</p>
      </div>

      {message && (
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: message.includes('✅') ? '#dcfce7' : '#fee2e2',
          color: message.includes('✅') ? '#15803d' : '#b91c1c',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleRegister}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Business Name *</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g., J&D Babies Store"
          value={formData.business_name}
          onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Phone Number *</label>
        <input
          style={inputStyle}
          type="tel"
          placeholder="e.g., 08012345678"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Email Address *</label>
        <input
          style={inputStyle}
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Password *</label>
        <input
          style={inputStyle}
          type="password"
          placeholder="At least 6 characters"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          minLength={6}
        />

        {/* Partnership Type Selection */}
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Partnership Type *</label>
        <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            padding: '15px',
            border: formData.partner_type === 'standard' ? '2px solid #2563eb' : '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: formData.partner_type === 'standard' ? '#eff6ff' : 'white'
          }}>
            <input
              type="radio"
              name="partner_type"
              value="standard"
              checked={formData.partner_type === 'standard'}
              onChange={(e) => setFormData({ ...formData, partner_type: e.target.value })}
              style={{ marginRight: '15px', transform: 'scale(1.2)' }}
            />
            <div>
              <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Standard Partnership</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>We provide power banks • You earn 40%</div>
            </div>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            padding: '15px',
            border: formData.partner_type === 'owner' ? '2px solid #10b981' : '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: formData.partner_type === 'owner' ? '#ecfdf5' : 'white'
          }}>
            <input
              type="radio"
              name="partner_type"
              value="owner"
              checked={formData.partner_type === 'owner'}
              onChange={(e) => setFormData({ ...formData, partner_type: e.target.value })}
              style={{ marginRight: '15px', transform: 'scale(1.2)' }}
            />
            <div>
              <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Owner Partnership</div>
              <div style={{ fontSize: '13
