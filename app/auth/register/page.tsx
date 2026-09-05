"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bankWarning, setBankWarning] = useState('');
  const router = useRouter();

  // Nigerian Banks List (Code - Name)
  const banks = [
    { code: '044', name: 'Access Bank' },
    { code: '058', name: 'Guaranty Trust Bank (GTBank)' },
    { code: '011', name: 'First Bank of Nigeria' },
    { code: '033', name: 'United Bank for Africa (UBA)' },
    { code: '057', name: 'Zenith Bank' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '032', name: 'Union Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '076', name: 'Polaris Bank' },
    { code: '030', name: 'Heritage Bank' },
    { code: '050', name: 'Ecobank' },
    { code: '082', name: 'Keystone Bank' },
    { code: '101', name: 'Providus Bank' },
    { code: '214', name: 'First City Monument Bank (FCMB)' },
    { code: '084', name: 'Enterprise Bank' },
    { code: '063', name: 'Access Bank (Diamond)' },
    { code: '010', name: 'Citibank' },
    { code: '042', name: 'FBNQuest Merchant Bank' },
    { code: '090', name: 'Kuda Bank' },
    { code: '090267', name: 'Opay' },
    { code: '090288', name: 'PalmPay' },
  ];

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setBankWarning('');

    if (!bankCode || !accountNumber) {
      setError('Please select a bank and enter your account number');
      setLoading(false);
      return;
    }

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

    if (authData.user) {
      let subaccountCode: string | null = null;

      // 2. Try to create Paystack Subaccount
      try {
        const supabaseUrl = 'https://zsjmudkesxrlrhtugdon.supabase.co';
        const edgeFunctionUrl = `${supabaseUrl}/functions/v1/create-paystack-subaccount`;

        const res = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_name: businessName,
            bank_code: bankCode,
            account_number: accountNumber,
            percentage: 30
          })
        });

        const data = await res.json();

        if (data.success && data.subaccount_code) {
          subaccountCode = data.subaccount_code;
        } else {
          setBankWarning('️ Account created, but bank verification failed. You can update your bank details later from your dashboard.');
        }
      } catch (err) {
        setBankWarning('️ Could not verify bank account. You can update your bank details later from your dashboard.');
      }

      // 3. Save owner profile to database
      const { error: dbError } = await supabase
        .from('location_owners')
        .insert([
          {
            user_id: authData.user.id,
            business_name: businessName,
            phone: phone,
            revenue_share_percentage: 30,
            bank_name: banks.find(b => b.code === bankCode)?.name || '',
            account_number: accountNumber,
            paystack_subaccount_code: subaccountCode,
            status: 'pending'
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

      {bankWarning && (
        <div style={{ padding: '15px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '8px', marginBottom: '20px' }}>
          {bankWarning}
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

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Bank *</label>
        <select
          style={inputStyle}
          value={bankCode}
          onChange={(e) => setBankCode(e.target.value)}
          required
        >
          <option value="">Select your bank</option>
          {banks.map(bank => (
            <option key={bank.code} value={bank.code}>{bank.name}</option>
          ))}
        </select>

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Account Number *</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="10-digit account number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
          required
          maxLength={10}
          pattern="[0-9]{10}"
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
          {loading ? 'Creating Account & Verifying Bank...' : 'Register Business'}
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
