"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('locations')
      .insert([
        {
          name: name,
          address: address,
          owner_name: ownerName,
          owner_phone: ownerPhone,
          status: 'active',
          is_visible_on_map: true
        }
      ]);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Success! Location added.');
      setName('');
      setAddress('');
      setOwnerName('');
      setOwnerPhone('');
    }
    setLoading(false);
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Add New Location</h1>
      
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
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Location Name</label>
          <input
            type="text"
            placeholder="e.g., ABC Lounge"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Address</label>
          <input
            type="text"
            placeholder="e.g., 123 Main St"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Owner Name</label>
          <input
            type="text"
            placeholder="Owner Name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Owner Phone</label>
          <input
            type="tel"
            placeholder="08012345678"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

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
          {loading ? 'Saving...' : 'Save Location'}
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#2563eb' }}>Back to Home</a>
      </div>
    </main>
  );
}
