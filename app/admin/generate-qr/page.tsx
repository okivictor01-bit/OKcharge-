"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function GenerateQRPage() {
  // Location State
  const [locCode, setLocCode] = useState('');
  const [locName, setLocName] = useState('');
  const [locAddress, setLocAddress] = useState('');
  const [generatedLocQR, setGeneratedLocQR] = useState('');

  // Power Bank State
  const [pbCode, setPbCode] = useState('');
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocId, setSelectedLocId] = useState('');
  const [generatedPbQR, setGeneratedPbQR] = useState('');

  useEffect(() => {
    // Load locations for the dropdown
    supabase.from('locations').select('id, name').then(({ data }) => {
      if (data) setLocations(data);
    });
  }, []);

  const handleCreateLocation = async () => {
    if (!locCode || !locName) return alert('Code and Name are required');

    const { error } = await supabase
      .from('locations')
      .insert({ location_code: locCode, name: locName, address: locAddress });

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Location Created!');
      // Generate QR URL
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://okcharge.pages.dev/rent?location=${locCode}`;
      setGeneratedLocQR(qrUrl);
    }
  };

  const handleCreatePowerBank = async () => {
    if (!pbCode || !selectedLocId) return alert('Code and Location are required');

    const { error } = await supabase
      .from('power_banks')
      .insert({ pb_code: pbCode, location_id: selectedLocId, status: 'available' });

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Power Bank Created!');
      // Generate QR URL
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://okcharge.pages.dev/owner/pb?code=${pbCode}`;
      setGeneratedPbQR(qrUrl);
    }
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '30px' }}>Generate QR Codes</h1>

      {/* SECTION 1: LOCATIONS */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', marginTop: 0 }}>1. Create Location QR</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Customers scan this to rent.</p>
        
        <input placeholder="Location Code (e.g., LAG01)" value={locCode} onChange={e => setLocCode(e.target.value.toUpperCase())} style={inputStyle} />
        <input placeholder="Location Name (e.g., Shoprite)" value={locName} onChange={e => setLocName(e.target.value)} style={inputStyle} />
        <input placeholder="Address" value={locAddress} onChange={e => setLocAddress(e.target.value)} style={inputStyle} />
        
        <button onClick={handleCreateLocation} style={btnStyle}>Create & Generate QR</button>

        {generatedLocQR && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold' }}>Scan to Rent:</p>
            <img src={generatedLocQR} alt="Location QR" style={{ width: '200px', height: '200px' }} />
            <p style={{ fontSize: '12px', color: '#64748b' }}>URL: okcharge.pages.dev/rent?location={locCode}</p>
          </div>
        )}
      </div>

      {/* SECTION 2: POWER BANKS */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '18px', marginTop: 0 }}>2. Create Power Bank QR</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Owners scan this to handover/return.</p>
        
        <input placeholder="Power Bank Code (e.g., PB002)" value={pbCode} onChange={e => setPbCode(e.target.value.toUpperCase())} style={inputStyle} />
        
        <select value={selectedLocId} onChange={e => setSelectedLocId(e.target.value)} style={inputStyle}>
          <option value="">Select Location...</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>

        <button onClick={handleCreatePowerBank} style={btnStyle}>Create & Generate QR</button>

        {generatedPbQR && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold' }}>Scan to Manage:</p>
            <img src={generatedPbQR} alt="PB QR" style={{ width: '200px', height: '200px' }} />
            <p style={{ fontSize: '12px', color: '#64748b' }}>URL: okcharge.pages.dev/owner/pb?code={pbCode}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin/dashboard" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Admin Dashboard</a>
      </div>
    </main>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '10px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  boxSizing: 'border-box' as const,
  fontSize: '14px'
};

const btnStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '10px'
};
