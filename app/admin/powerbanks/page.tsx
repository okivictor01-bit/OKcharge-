"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AddPowerBankPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [pbCode, setPbCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data } = await supabase.from('locations').select('id, name');
    if (data) setLocations(data);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!selectedLocation) {
      setMessage('Error: Please select a location.');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('power_banks')
      .insert([
        {
          pb_code: pbCode,
          location_id: selectedLocation,
          status: 'available'
        }
      ]);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Success! Power Bank ' + pbCode + ' added.');
      setPbCode('');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box' as const
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Add Power Bank</h1>
      
      {message && (
        <div style={{ 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          backgroundColor: message.includes('Success') ? '#dcfce7' : '#fee2e2',
          color: message.includes('Success') ? '#15803d' : '#b91c1c'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Select Location *</label>
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

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Power Bank Code *</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g., PB-001"
          value={pbCode}
          onChange={(e) => setPbCode(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading ? '#999' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Saving...' : 'Add Power Bank'}
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Admin</a>
      </div>
    </main>
  );
}
