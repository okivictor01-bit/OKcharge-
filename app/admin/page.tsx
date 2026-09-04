"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Akure', // Default city
    owner_name: '',
    owner_phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Comprehensive list of Southwest Nigeria towns
  const cities = [
    // Ondo State
    'Akure', 'Ore', 'Okitipupa', 'Ondo', 'Owo', 'Ikare-Akoko', 'Oka-Akoko', 'Idanre', 'Ifon', 'Ode-Irele', 'Igbokoda', 'Ayetoro', 'Araromi', 'Ijebu-Igbo',
    // Lagos State
    'Lagos', 'Ikeja', 'Epe', 'Ikorodu', 'Badagry', 'Lekki', 'Surulere', 'Yaba', 'Mushin', 'Oshodi', 'Agege', 'Alimosho',
    // Oyo State
    'Ibadan', 'Ogbomoso', 'Oyo', 'Iseyin', 'Saki', 'Igboho', 'Eruwa', 'Kishi', 'Igbeti', 'Lalupon', 'Moniya', 'Bodija', 'Ring Road', 'Dugbe', 'Challenge', 'Iwo',
    // Osun State
    'Osogbo', 'Ilesa', 'Ife', 'Ede', 'Iwo', 'Ila-Orangun', 'Oke-Ila', 'Ikirun', 'Iragbiji', 'Modakeke', 'Ejigbo', 'Ikire', 'Inisa', 'Ipetumodu',
    // Ogun State
    'Abeokuta', 'Ijebu-Ode', 'Sagamu', 'Ota', 'Ijebu-Igbo', 'Ilaro', 'Ago-Iwoye', 'Owode', 'Odeda', 'Iperu', 'Remo', 'Isheri',
    // Ekiti State
    'Ado-Ekiti', 'Ikere-Ekiti', 'Emure-Ekiti', 'Omuo-Ekiti', 'Ijero-Ekiti', 'Aramoko-Ekiti', 'Ise-Ekiti', 'Oye-Ekiti', 'Ilupeju-Ekiti',
    // Kwara State
    'Ilorin', 'Offa', 'Omu-Aran', 'Lafiagi', 'Patigi', 'Jebba', 'Kaiama', 'Share', 'Omu-Aran'
  ];

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    let lat = null;
    let lng = null;

    // 1. Try to automatically find coordinates
    try {
      const searchQuery = `${formData.address}, ${formData.city}, Nigeria`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        lat = parseFloat(data[0].lat);
        lng = parseFloat(data[0].lon);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }

    // 2. Save to database
    const { error } = await supabase
      .from('locations')
      .insert([
        {
          name: formData.name,
          address: formData.address,
          owner_name: formData.owner_name,
          owner_phone: formData.owner_phone,
          status: 'active',
          is_visible_on_map: true,
          latitude: lat,
          longitude: lng
        }
      ]);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      if (lat && lng) {
        setMessage('Success! Location added with GPS coordinates.');
      } else {
        setMessage('Location added, but coordinates not found. You can add them manually later.');
      }
      setFormData({ name: '', address: '', city: 'Akure', owner_name: '', owner_phone: '' });
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
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Location Name *</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g., ABC Lounge"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Street Address *</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g., 167, old ore-benin road"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>City / Town *</label>
        <select
          style={inputStyle}
          value={formData.city}
          onChange={(e) => setFormData({...formData, city: e.target.value})}
        >
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Owner Name</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g., John Doe"
          value={formData.owner_name}
          onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Owner Phone</label>
        <input
          style={inputStyle}
          type="tel"
          placeholder="e.g., 08012345678"
          value={formData.owner_phone}
          onChange={(e) => setFormData({...formData, owner_phone: e.target.value})}
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
          {loading ? 'Finding Coordinates & Saving...' : 'Save Location'}
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Home</a>
      </div>
    </main>
  );
}
