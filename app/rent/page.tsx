"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RentPage() {
  const router = useRouter();
  const [duration, setDuration] = useState('1');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paystackScriptLoaded, setPaystackScriptLoaded] = useState(false);

  const prices: Record<string, number> = {
    '1': 100,
    '3': 200,
    '5': 300,
    '24': 800
  };

  const currentPrice = prices[duration] || 100;

  // Load Paystack script
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => setPaystackScriptLoaded(true);
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  const handleCheckout = (e: any) => {
    e.preventDefault();
    
    if (!agreeTerms) {
      alert('Please agree to the Terms & Conditions to continue.');
      return;
    }

    if (!formData.name || !formData.phone) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    // Generate a unique reference
    const reference = `OKCHARGE_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Initialize Paystack
    const handler = (window as any).PaystackPop?.setup({
      key: 'pk_live_9dd06423b57f6a6f6927e3ea2e28a101baa01fba',
      email: formData.email || formData.phone + '@okcharge.local',
      amount: currentPrice * 100, // Paystack uses kobo (multiply by 100)
      currency: 'NGN',
      ref: reference,
      firstname: formData.name.split(' ')[0],
      lastname: formData.name.split(' ').slice(1).join(' ') || '',
      phone: formData.phone,
      metadata: {
        custom_fields: [
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: formData.name
          },
          {
            display_name: 'Duration',
            variable_name: 'duration',
            value: `${duration} hour${duration !== '1' ? 's' : ''}`
          },
          {
            display_name: 'Station',
            variable_name: 'station',
            value: 'Akure Main Branch'
          }
        ]
      },
      callback: function(response: any) {
        // Payment successful
        alert('Payment successful! Reference: ' + response.reference);
        // TODO: Save rental to database here
        setLoading(false);
        // Redirect to success page or show ticket
        router.push('/rent/success?ref=' + response.reference);
      },
      onClose: function() {
        alert('Payment window closed. Please try again.');
        setLoading(false);
      }
    });

    if (handler) {
      handler.openIframe();
    } else {
      alert('Payment system is loading. Please try again in a moment.');
      setLoading(false);
    }
  };

  return (
    <main style={{ 
      fontFamily: 'sans-serif', 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh', 
      paddingBottom: '100px'
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

          <button
            type="submit"
            disabled={loading || !paystackScriptLoaded}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: loading || !paystackScriptLoaded ? '#94a3b8' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading || !paystackScriptLoaded ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
            }}
          >
            {loading ? 'Processing...' : !paystackScriptLoaded ? 'Loading...' : `Pay ₦${currentPrice} & Rent`}
          </button>
        </form>
      </div>
    </main>
  );
}
