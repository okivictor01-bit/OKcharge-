"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Script from 'next/script';

interface Location {
  id: string;
  name: string;
  address: string;
  subaccount_code: string | null; // Added to hold the owner's Paystack code
}

export default function RentPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [duration, setDuration] = useState('1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState('');
  const [error, setError] = useState('');
  const [paystackReady, setPaystackReady] = useState(false);

  const pricing: Record<string, number> = {
    '1': 100,
    '6': 300,
    '12': 500,
    '24': 800,
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    // We join with location_owners to get the subaccount code in one go!
    const { data } = await supabase
      .from('locations')
      .select(`
        id, 
        name, 
        address,
        location_owners (
          paystack_subaccount_code
        )
      `)
      .eq('status', 'active')
      .eq('is_visible_on_map', true);
    
    if (data) {
      const formattedData = data.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        subaccount_code: loc.location_owners?.paystack_subaccount_code || null
      }));
      setLocations(formattedData);
    }
  };

  const generateTicketCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'RNT-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handlePayment = (e: any) => {
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

    // 🚀 Find the selected location to get its subaccount code
    const selectedLoc = locations.find(loc => loc.id === selectedLocation);
    const subaccount = selectedLoc?.subaccount_code || undefined;

    const handler = (window as any).PaystackPop.setup({
      key: 'pk_live_9dd06423b57f6a6f6927e3ea2e28a101baa01fba',
      email: email,
      amount: amount,
      ref: ticketCode,
      subaccount: subaccount, // 🎯 THIS IS THE MAGIC LINE THAT ENABLES AUTO-SPLIT!
      callback: function(response: any) {
        console.log('Payment successful:', response);
        saveRental(ticketCode, response.reference);
      },
      onClose: function() {
        setError('Payment window closed');
        setLoading(false);
      }
    });

    handler.openIframe();
  };

  const saveRental = async (ticketCode: string, reference: string) => {
    try {
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
            paystack_reference: reference,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Database error:', error);
        setError('Payment successful but failed to save. Ticket: ' + ticketCode);
      } else {
        setTicket(ticketCode);
      }
    } catch (err) {
      setError('Error saving rental: ' + err);
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
    <>
      <Script 
        src="https://js.paystack.co/v1/inline.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Paystack loaded');
          setPaystackReady(true);
        }}
        onError={() => {
          console.error('Failed to load Paystack');
          setError('Payment system unavailable');
        }}
      />

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

            {!paystackReady && (
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#fff3cd', 
                color: '#856404',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                Loading payment system...
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
                <option value="1">1 hour - ₦100</option>
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
                disabled={loading || !paystackReady}
                style={{
                  width: '100%',
                  padding: '18px',
                  backgroundColor: loading || !paystackReady ? '#999' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: loading || !paystackReady ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Processing...' : !paystackReady ? 'Loading...' : 'Pay Now with Paystack'}
              </button>
            </form>

            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Home</a>
            </div>
          </>
        )}
      </main>
    </>
  );
}
