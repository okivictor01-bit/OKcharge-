"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RentPage() {
  const router = useRouter();
  const [duration, setDuration] = useState('1');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('1');

  const prices: Record<string, number> = {
    '1': 100,
    '3': 250,
    '5': 400,
    '24': 900
  };

  const currentPrice = prices[duration] || 100;

  // Load Paystack script and wait for it to be ready
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20;

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      console.log('Paystack script loaded, checking for PaystackPop...');
      
      const checkReady = setInterval(() => {
        attempts++;
        if ((window as any).PaystackPop) {
          console.log('PaystackPop is ready!');
          setPaystackReady(true);
          clearInterval(checkReady);
        } else if (attempts >= maxAttempts) {
          console.error('PaystackPop not available after 20 attempts');
          clearInterval(checkReady);
        }
      }, 500);
    };
    script.onerror = () => {
      console.error('Failed to load Paystack script');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleDurationSelect = (time: string) => {
    setDuration(time);
    setSelectedDuration(time);
  };

  const handleCheckout = async (e: any) => {
    e.preventDefault();
    
    if (!agreeTerms) {
      alert('Please agree to the Terms & Conditions to continue.');
      return;
    }

    if (!formData.name || !formData.phone) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!paystackReady) {
      alert('Payment system is still loading. Please wait a moment and try again.');
      return;
    }

    setLoading(true);

    const reference = `OKCHARGE_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const ticketCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const paystackPop = (window as any).PaystackPop;
      
      if (!paystackPop || !paystackPop.setup) {
        throw new Error('PaystackPop.setup is not available');
      }

      const handler = paystackPop.setup({
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
            { display_name: 'Customer Name', variable_name: 'customer_name', value: formData.name },
            { display_name: 'Duration', variable_name: 'duration', value: `${duration} hour${duration !== '1' ? 's' : ''}` },
            { display_name: 'Ticket Code', variable_name: 'ticket_code', value: ticketCode }
          ]
        },
        callback: async function(response: any) {
          console.log('Payment successful:', response);
          
          try {
            await supabase.from('rentals').insert({
              ticket_code: ticketCode,
              customer_name: formData.name,
              customer_phone: formData.phone,
              customer_email: formData.email || null,
              duration_hours: parseInt(duration),
              amount_paid: currentPrice,
              payment_reference: response.reference,
              status: 'active',
              started_at: new Date().toISOString()
            });
          } catch (dbError) {
            console.error('Database error:', dbError);
          }

          setLoading(false);
          router.push(`/rent/success?ref=${response.reference}&ticket=${ticketCode}`);
        },
        onClose: function() {
          console.log('Payment window closed');
          setLoading(false);
        }
      });

      handler.openIframe();
    } catch (error: any) {
      console.error('Paystack error:', error);
      setLoading(false);
      alert('Payment error: ' + error.message);
    }
  };

  return (
    <main style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f1f5f9',
      minHeight: '100vh',
      paddingBottom: '120px'
    }}>
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
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
              Phone Number (WhatsApp) <span style={{ color: '#ef4444' }}>*</span>
