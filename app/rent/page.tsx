"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Location {
  id: string;
  name: string;
  address: string;
}

export default function RentPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [duration, setDuration] = useState('6');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState('');
  const [error, setError] = useState('');

  const pricing: Record<string, number> = {
    '6': 300,
    '12': 500,
    '24': 800,
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('id, name, address')
      .eq('status', 'active')
      .eq('is_visible_on_map', true);
    if (data) setLocations(data);
  };

  const generateTicketCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'RNT-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const loadPaystackScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).PaystackPop) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack'));
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e: any) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      setError('Please select a location');
      return;
    }
    if (!customerName || !customerPhone) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    const amount = pricing[duration] * 100;
    const ticketCode = generateTicketCode();
    const email = `${customerPhone.replace(/\s/g, '')}@okcharge.ng`;

    try {
      await loadPaystackScript();

      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: amount,
        currency: 'NGN',
        ref: ticketCode,
        metadata: {
          custom_fields: [
            { display_name: 'Customer Name', variable_name: 'customer_name', value: customerName },
            { display_name: 'Customer Phone', variable_name: 'customer_phone', value: customerPhone },
            { display_name: 'Location ID', variable_name: 'location_id', value: selectedLocation },
            { display_name: 'Duration', variable_name: 'duration', value: duration },
            { display_name: 'Ticket Code', variable_name: 'ticket_code', value: ticketCode }
          ]
        },
        callback: async (response: any) => {
          const { error } = await supabase
            .from('rentals')
            .insert([
              {
                ticket_code: ticketCode,
                location_id: selectedLocation,
                customer_name: customerName,
                customer_phone: customerPhone,
                duration_hours: parseInt(duration),
                amount_paid: pricing[duration],
                status: 'paid',
                paystack_reference: response.reference,
                created_at: new Date().toISOString()
              }
            ]);

          if (error) {
            setError('Error saving rental: ' + error.message);
          } else {
            setTicket(ticketCode);
          }
          setLoading(false);
        },
        onClose: () => {
          setError('Payment window closed');
          setLoading(false);
        }
      });

      handler.openIframe();
    } catch (err) {
      setError('Failed to load payment system. Please refresh and try again.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '15px',
    marginBottom: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box'
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      {ticket ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#0f172a' }}>Payment Successful!</h1>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>Your rental ticket is ready</p>
          
          <div style={{ 
            backgroundColor: '#f8fafc', 
            padding: '30px', 
            borderRadius: '12px', 
            border: '2px dashed #2563eb',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>YOUR TICKET CODE</p>
            <h2 style={{ 
              fontSize: '32px', 
              color: '#2563eb', 
              margin: '0',
              fontFamily: 'monospace',
              letterSpacing: '2px'
            }}>
              {ticket}
            </h2>
          </div>

          <div style={{ 
            backgroundColor: '#fff3cd', 
            padding: '15px', 
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}> What's Next?</h3>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
              <li>Show this ticket code to the location staff</li>
              <li>Staff will scan a power bank and enter your ticket</li>
              <li>Collect the power bank and enjoy!</li>
              <li>Return before {duration} hours to avoid extra charges</li>
            </ol>
          </div>

          <button
            onClick={() => window.print()}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '10px',
              cursor: 'pointer'
            }}
          >
            📄 Print / Save Ticket
          </button>

          <a href="/" style={{ display: 'block', textAlign: 'center', color: '#2563eb', textDecoration: 'none', marginTop: '10px' }}>
            ← Back to Home
          </a>
        </div>
      ) : (
        <>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}> Rent a Power Bank</h1>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>Fill in your details and pay securely</p>

          {error && (
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#fee2e2', 
              color: '#b91c1c',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handlePayment}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Select Location *</label>
            <select
              style={inputStyle}
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              required
            >
              <option value="">-- Choose a location --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>

            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Rental Duration *</label>
            <select
              style={inputStyle}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="6">6 hours - ₦300</option>
              <option value="12">12 hours - ₦500</option>
              <option value="24">24 hours - ₦800</option>
            </select>

            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Your Name *</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g., John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />

            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Phone Number *</label>
            <input
              style={inputStyle}
              type="tel"
              placeholder="e.g., 08012345678"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />

            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '15px', 
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>Total Amount</p>
              <h2 style={{ margin: '5px 0 0 0', fontSize: '28px', color: '#0f172a' }}>
                ₦{pricing[duration].toLocaleString()}
              </h2>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '18px',
                backgroundColor: loading ? '#999' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Processing...' : 'Pay Now with Paystack'}
            </button>
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Home</a>
          </div>
        </>
      )}
    </main>
  );
}
