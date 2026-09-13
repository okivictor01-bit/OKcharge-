"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RentPage() {
  const router = useRouter();
  const [duration, setDuration] = useState('1');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const prices: Record<string, number> = {
    '1': 100,
    '3': 200,
    '5': 300,
    '24': 800
  };

  const currentPrice = prices[duration] || 100;

  const handleCheckout = (e: any) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Please agree to the Terms & Conditions to continue.');
      return;
    }
    setLoading(true);
    // TODO: Integrate Paystack here
    setTimeout(() => {
      setLoading(false);
      alert('Redirecting to Paystack...');
    }, 1000);
  };

  return (
    <main style={{ 
      fontFamily: 'sans-serif', 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh', 
      paddingBottom: '100px' // Space for sticky button
    }}>
      {/* Header */}
      <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Complete Your Rental</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#94a3b8' }}>Station: Akure Main Branch</p>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        
        {/* Step 1: Duration */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginTop: 0, marginBottom: '15px' }}>1. Choose Duration</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {Object.entries(prices).map(([time, price]) => (
              <button
                key={time}
                onClick={() => setDuration(time)}
                style={{
                  padding: '15px',
                  borderRadius: '8px',
                  border: duration === time ? '2px solid #10b981' : '1px solid #e2e8f0',
                  backgroundColor: duration === time ? '#ecfdf5' : 'white',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '16px' }}>{time} Hour{time !== '1' ? 's' : ''}</div>
                <div style={{ color: '#10b981', fontWeight: 'bold', marginTop: '5px' }}>₦{price}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Customer Data */}
        <form onSubmit={handleCheckout} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginTop: 0, marginBottom: '15px' }}>2. Your Details</h2>
          
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px', color: '#475569' }}>Full Name *</label>
          <input
            type="text"
            required
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
          />

          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px', color: '#475569' }}>Phone Number (WhatsApp) *</label>
          <input
            type="tel"
            required
            placeholder="08012345678"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
          />

          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px', color: '#475569' }}>Email Address (Optional)</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
          />

          {/* Terms Checkbox */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}>
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ marginTop: '4px', transform: 'scale(1.2)' }}
              required
            />
            <label htmlFor="terms" style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
              I agree to the <a href="/terms" target="_blank" style={{ color: '#2563eb', textDecoration: 'none' }}>Terms & Conditions</a>, including the ₦15,000 replacement fee for unreturned power banks.
            </label>
          </div>
        </form>
      </div>

      {/* Sticky Pay Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: '15px 20px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '16px',
            backgroundColor: loading ? '#94a3b8' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
          }}
        >
          {loading ? 'Processing...' : `Pay ₦${currentPrice} & Rent`}
        </button>
      </div>
    </main>
  );
}
