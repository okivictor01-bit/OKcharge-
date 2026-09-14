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
  const [selectedDuration, setSelectedDuration] = useState('1');

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

  const handleDurationSelect = (time: string) => {
    setDuration(time);
    setSelectedDuration(time);
  };

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

    const reference = `OKCHARGE_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const handler = (window as any).PaystackPop?.setup({
      key: 'pk_live_9dd06423b57f6a6f6927e3ea2e28a101baa01fba',
      email: formData.email || formData.phone + '@okcharge.local',
      amount: currentPrice * 100,
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
          }
        ]
      },
      callback: function(response: any) {
        setLoading(false);
        router.push('/rent/success?ref=' + response.reference);
      },
      onClose: function() {
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f1f5f9',
      minHeight: '100vh',
      paddingBottom: '120px'
    }}>
      {/* Animated Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        color: 'white', 
        padding: '30px 20px', 
        textAlign: 'center',
        borderBottomLeftRadius: '30px',
        borderBottomRightRadius: '30px',
        boxShadow: '0 10px 40px rgba(15, 23, 42, 0.3)'
      }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔋</div>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>Complete Your Rental</h1>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        
        {/* Step 1: Duration Selection */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '20px', 
          marginBottom: '20px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '16px',
              marginRight: '12px'
            }}>1</div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Choose Duration</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {Object.entries(prices).map(([time, price]) => {
              const isSelected = selectedDuration === time;
              return (
                <button
                  key={time}
                  onClick={() => handleDurationSelect(time)}
                  style={{
                    padding: '20px 15px',
                    borderRadius: '16px',
                    border: isSelected ? '2px solid #10b981' : '2px solid #e2e8f0',
                    backgroundColor: isSelected ? '#ecfdf5' : 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none'
                  }}
                >
                  <div style={{ fontWeight: '700', color: isSelected ? '#0f172a' : '#64748b', fontSize: '17px', marginBottom: '5px' }}>
                    {time} Hour{time !== '1' ? 's' : ''}
                  </div>
                  <div style={{ 
                    color: isSelected ? '#10b981' : '#94a3b8', 
                    fontWeight: '800', 
                    fontSize: '18px',
                    marginTop: '5px'
                  }}>
                    ₦{price}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Customer Details Form */}
        <form onSubmit={handleCheckout} style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '20px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '16px',
              marginRight: '12px'
            }}>2</div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Your Details</h2>
          </div>
          
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '16px', 
                border: '2px solid #e2e8f0', 
                borderRadius: '12px', 
                fontSize: '16px', 
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#10b981'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
              Phone Number (WhatsApp) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="08012345678"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '16px', 
                border: '2px solid #e2e8f0', 
                borderRadius: '12px', 
                fontSize: '16px', 
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#10b981'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
              Email Address <span style={{ color: '#94a3b8', fontSize: '12px' }}>(Optional)</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '16px', 
                border: '2px solid #e2e8f0', 
                borderRadius: '12px', 
                fontSize: '16px', 
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#10b981'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Terms Checkbox */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '12px', 
            marginBottom: '25px',
            padding: '15px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ 
                marginTop: '3px', 
                transform: 'scale(1.3)',
                cursor: 'pointer',
                accentColor: '#10b981'
              }}
              required
            />
            <label 
              htmlFor="terms" 
              style={{ 
                fontSize: '13px', 
                color: '#64748b', 
                lineHeight: '1.5',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              I agree to the <a href="/terms" target="_blank" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Terms & Conditions</a>, including the <strong style={{ color: '#ef4444' }}>₦15,000</strong> replacement fee for unreturned power banks.
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
        padding: '20px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 1000,
        borderTop: '1px solid #e2e8f0'
      }}>
        <button
          onClick={(e) => {
            const form = document.querySelector('form');
            if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }}
          disabled={loading || !paystackScriptLoaded}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '18px 24px',
            background: loading || !paystackScriptLoaded ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: loading || !paystackScriptLoaded ? 'not-allowed' : 'pointer',
            boxShadow: loading || !paystackScriptLoaded ? 'none' : '0 6px 20px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{ 
                width: '20px', 
                height: '20px', 
                border: '3px solid rgba(255,255,255,0.3)', 
                borderTop: '3px solid white', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite'
              }} />
              Processing...
            </span>
          ) : !paystackScriptLoaded ? (
            'Loading Payment...'
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Pay ₦{currentPrice} & Rent Now 🔓
            </span>
          )}
        </button>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
