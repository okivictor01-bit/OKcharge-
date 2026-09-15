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
    { code: '999992', name: 'Opay Digital' },
    { code: '090288', name: 'PalmPay' },
    { code: '50211', name: 'Kuda Bank' },
    { code: '082', name: 'Keystone Bank' },
    { code: '050', name: 'Ecobank' },
    { code: '076', name: 'Polaris Bank' },
    { code: '214', name: 'FCMB' },
    { code: '030', name: 'Heritage Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '101', name: 'Providus Bank' },
  ];

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.password.length < 6) {
      setMessage('❌ Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.account_number.length !== 10) {
      setMessage('❌ Account number must be 10 digits');
      setLoading(false);
      return;
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Create owner profile with 50% revenue share
      const { error: ownerError } = await supabase.from('location_owners').insert({
        user_id: authData.user.id,
        business_name: formData.business_name,
        phone: formData.phone,
        email: formData.email,
        bank_name: banks.find(b => b.code === formData.bank_name)?.name || '',
        account_number: formData.account_number,
        revenue_share: 50, // UPDATED: 50% standard
        revenue_share_percentage: 50, // UPDATED: 50% standard
        status: 'pending',
      });

      if (ownerError) throw ownerError;

      setMessage('✅ Registration successful! Please wait for admin approval.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      setMessage('❌ Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <main style={{ 
      fontFamily: 'sans-serif', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '500px', width: '100%' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>Partner Registration</h1>
            <p style={{ color: '#64748b', fontSize: '16px' }}>Join OKcharge and start earning</p>
          </div>

          {message && (
            <div style={{ 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px', 
              backgroundColor: message.includes('✅') ? '#dcfce7' : '#fee2e2', 
              color: message.includes('✅') ? '#15803d' : '#b91c1c',
              fontSize: '14px'
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)' 
          }}>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., J&D Babies Store"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px', 
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g., 08012345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px', 
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px', 
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px', 
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* UPDATED: Removed Partnership Type Selection - Now Fixed at 50% */}
            <div style={{ 
              marginBottom: '20px', 
              padding: '20px', 
              backgroundColor: '#f0fdf4', 
              borderRadius: '8px', 
              border: '2px solid #10b981' 
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '16px' }}>Partnership Terms</h3>
              <p style={{ margin: '5px 0', color: '#64748b', fontSize: '14px' }}>
                ✅ <strong>OKcharge provides all power banks</strong>
              </p>
              <p style={{ margin: '5px 0', color: '#64748b', fontSize: '14px' }}>
                💰 <strong>You earn 50% of all revenue</strong>
              </p>
              <p style={{ margin: '5px 0', color: '#64748b', fontSize: '14px' }}>
                📍 <strong>We manage all equipment & maintenance</strong>
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                Bank *
              </label>
              <select
                required
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px', 
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select your bank</option>
                {banks.map(bank => (
                  <option key={bank.code} value={bank.code}>{bank.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                Account Number *
              </label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="10-digit account number"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px', 
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '16px', 
                backgroundColor: loading ? '#94a3b8' : '#10b981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '16px', 
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Registering...' : 'Register Business'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
              Login Here
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
