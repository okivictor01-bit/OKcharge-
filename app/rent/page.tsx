"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Script from 'next/script';

interface Location {
  id: string;
  name: string;
  address: string;
  state: string;
  city: string;
  town: string;
  subaccount_code: string | null;
}

export default function RentPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [duration, setDuration] = useState('1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState('');
  const [error, setError] = useState('');
  const [paystackReady, setPaystackReady] = useState(false);
  
  // Search fields
  const [searchState, setSearchState] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchTown, setSearchTown] = useState('');

  const pricing: Record<string, number> = {
    '1': 100,
    '3': 200,
    '5': 300,
    '24': 800,
  };

  useEffect(() => { 
    fetchLocations(); 
  }, []);

  useEffect(() => {
    filterLocations();
  }, [searchState, searchCity, searchTown, locations]);

  const fetchLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select(`id, name, address, state, city, town, location_owners (paystack_subaccount_code)`)
      .eq('status', 'active')
      .eq('is_visible_on_map', true);
    
    if (data) {
      const formattedData = data.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        state: loc.state || '',
        city: loc.city || '',
        town: loc.town || '',
        subaccount_code: loc.location_owners?.paystack_subaccount_code || null
      }));
      setLocations(formattedData);
      setFilteredLocations(formattedData);
    }
  };

  const filterLocations = () => {
    let filtered = locations;
    
    if (searchState.trim()) {
      filtered = filtered.filter(loc => 
        loc.state.toLowerCase().includes(searchState.toLowerCase())
      );
    }
    
    if (searchCity.trim()) {
      filtered = filtered.filter(loc => 
        loc.city.toLowerCase().includes(searchCity.toLowerCase())
      );
    }
    
    if (searchTown.trim()) {
      filtered = filtered.filter(loc => 
        loc.town.toLowerCase().includes(searchTown.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchTown.toLowerCase())
      );
    }
    
    setFilteredLocations(filtered);
    setSelectedLocation(''); // Reset selection when filtering
  };

  const clearSearch = () => {
    setSearchState('');
    setSearchCity('');
    setSearchTown('');
    setFilteredLocations(locations);
    setSelectedLocation('');
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
    if (!selectedLocation) { setError('Please select a location'); return; }
    if (!customerName || !customerPhone) { setError('Please fill in all fields'); return; }

    setLoading(true);
    setError('');

    const amount = pricing[duration] * 100;
    const ticketCode = generateTicketCode();
    const email = `${customerPhone.replace(/\s/g, '')}@okcharge.ng`;
    const selectedLoc = locations.find(loc => loc.id === selectedLocation);
    const subaccount = selectedLoc?.subaccount_code || undefined;

    const handler = (window as any).PaystackPop.setup({
      key: 'pk_live_9dd06423b57f6a6f6927e3ea2e28a101baa01fba',
      email: email,
      amount: amount,
      ref: ticketCode,
      subaccount: subaccount,
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
      const { error } = await supabase.from('rentals').insert([{
        ticket_code: ticketCode, location_id: selectedLocation, customer_name: customerName,
        customer_phone: customerPhone, duration_hours: parseInt(duration), amount_paid: pricing[duration],
        status: 'paid', paystack_reference: reference, created_at: new Date().toISOString()
      }]);

      if (error) { setError('Payment successful but failed to save. Ticket: ' + ticketCode); } 
      else { setTicket(ticketCode); }
    } catch (err) { setError('Error saving rental: ' + err); }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' };
  const selectStyle: React.CSSProperties = { width: '100%', padding: '15px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' };

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" onLoad={() => setPaystackReady(true)} onError={() => setError('Payment system unavailable')} />
      <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
        {ticket ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
            <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#0f172a' }}>Payment Successful!</h1>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Your rental ticket is ready</p>
            <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '12px', border: '2px dashed #2563eb', marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>YOUR TICKET CODE</p>
              <h2 style={{ fontSize: '32px', color: '#2563eb', margin: '0', fontFamily: 'monospace', letterSpacing: '2px' }}>{ticket}</h2>
            </div>
            <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>What's Next?</h3>
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                <li>Show this ticket code to the location staff</li>
                <li>Staff will scan a power bank and enter your ticket</li>
                <li>Collect the power bank and enjoy!</li>
                <li>Return before {duration} hours to avoid extra charges</li>
              </ol>
            </div>
            <button onClick={() => window.print()} style={{ width: '100%', padding: '15px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', cursor: 'pointer' }}> Print / Save Ticket</button>
            <a href="/" style={{ display: 'block', textAlign: 'center', color: '#2563eb', textDecoration: 'none', marginTop: '10px' }}>← Back to Home</a>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Rent a Power Bank</h1>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Find a station and pay securely</p>
            {error && <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
            {!paystackReady && <div style={{ padding: '15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>Loading payment system...</div>}
            
            <form onSubmit={handlePayment}>
              {/* Search Section */}
              <div style={{ backgroundColor: '#f0f9ff', padding: '20px', borderRadius: '12px', border: '1px solid #bae6fd', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0369a1' }}> Find a Station</h3>
                
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>State</label>
                <input 
                  style={inputStyle} 
                  type="text" 
                  placeholder="e.g., Lagos" 
                  value={searchState}
                  onChange={(e) => setSearchState(e.target.value)}
                />

                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>City</label>
                <input 
                  style={inputStyle} 
                  type="text" 
                  placeholder="e.g., Ikeja" 
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />

                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Town/Area</label>
                <input 
                  style={inputStyle} 
                  type="text" 
                  placeholder="e.g., Allen Avenue" 
                  value={searchTown}
                  onChange={(e) => setSearchTown(e.target.value)}
                />

                {(searchState || searchCity || searchTown) && (
                  <button 
                    type="button"
                    onClick={clearSearch}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      backgroundColor: '#f87171', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      fontSize: '14px', 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginBottom: '10px'
                    }}
                  >
                    Clear Search
                  </button>
                )}

                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '10px' }}>
                  Found {filteredLocations.length} station{filteredLocations.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Location Selection */}
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Select Location *</label>
              <select style={selectStyle} value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} required>
                <option value="">-- Choose a location --</option>
                {filteredLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} - {loc.address} {loc.city && `(${loc.city})`}
                  </option>
                ))}
              </select>

              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Rental Duration *</label>
              <select style={selectStyle} value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="1">1 hour - ₦100</option>
                <option value="3">3 hours - ₦200</option>
                <option value="5">5 hours - ₦300</option>
                <option value="24">24 hours - ₦800</option>
              </select>

              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Your Name *</label>
              <input style={selectStyle} type="text" placeholder="e.g., John Doe" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />

              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Phone Number *</label>
              <input style={selectStyle} type="tel" placeholder="e.g., 08012345678" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />

              <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>Total Amount</p>
                <h2 style={{ margin: '5px 0 0 0', fontSize: '28px', color: '#0f172a' }}>₦{pricing[duration].toLocaleString()}</h2>
              </div>

              <button type="submit" disabled={loading || !paystackReady} style={{ width: '100%', padding: '18px', backgroundColor: loading || !paystackReady ? '#999' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: loading || !paystackReady ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Processing...' : !paystackReady ? 'Loading...' : 'Pay Now with Paystack'}
              </button>
            </form>
            <div style={{ marginTop: '30px', textAlign: 'center' }}><a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Home</a></div>
          </>
        )}
      </main>
    </>
  );
}
