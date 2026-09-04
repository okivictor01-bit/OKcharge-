"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export default function EditCoordinatesPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('*')
      .eq('status', 'active');
    if (data) setLocations(data);
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    
    if (!selectedLocation || !latitude || !longitude) {
      setMessage('Error: Please fill all fields');
      return;
    }

    const { error } = await supabase
      .from('locations')
      .update({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      })
      .eq('id', selectedLocation);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Success! Coordinates saved.');
      setLatitude('');
      setLongitude('');
    }
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
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Edit Location Coordinates</h1>
      
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

      <form onSubmit={handleSave}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Select Location *</label>
        <select
          style={inputStyle}
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          required
        >
          <option value="">-- Choose a location --</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} {loc.latitude ? '(Has coordinates)' : '(No coordinates)'}
            </option>
          ))}
        </select>

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Latitude *</label>
        <input
          style={inputStyle}
          type="number"
          step="0.000001"
          placeholder="e.g., 7.2571"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Longitude *</label>
        <input
          style={inputStyle}
          type="number"
          step="0.000001"
          placeholder="e.g., 5.2054"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          required
        />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          Save Coordinates
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Admin</a>
      </div>
    </main>
  );
}
