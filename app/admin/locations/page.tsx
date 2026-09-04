"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Location {
  id: string;
  name: string;
  address: string;
  owner_name?: string;
  owner_phone?: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export default function LocationsListPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setLocations(data);
    }
    setLoading(false);
  };

  const cardStyle = {
    padding: '20px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '12px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const badgeStyle = (hasCoords: boolean) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: hasCoords ? '#dcfce7' : '#fee2e2',
    color: hasCoords ? '#15803d' : '#b91c1c'
  });

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px' }}>All Locations ({locations.length})</h1>
        <a 
          href="/admin" 
          style={{ 
            backgroundColor: '#2563eb', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '8px', 
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          + Add New
        </a>
      </div>

      {loading ? (
        <p>Loading locations...</p>
      ) : locations.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#666', marginBottom: '15px' }}>No locations yet</p>
          <a href="/admin" style={{ color: '#2563eb', fontWeight: 'bold' }}>Add your first location</a>
        </div>
      ) : (
        locations.map((loc) => (
          <div key={loc.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#1f2937' }}>{loc.name}</h2>
              <span style={badgeStyle(!!loc.latitude && !!loc.longitude)}>
                {loc.latitude && loc.longitude ? '✓ Has GPS' : '⚠ No GPS'}
              </span>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <p style={{ margin: '5px 0', color: '#4b5563', fontSize: '14px' }}>
                📍 {loc.address}
              </p>
              {loc.owner_name && (
                <p style={{ margin: '5px 0', color: '#4b5563', fontSize: '14px' }}>
                  👤 {loc.owner_name}
                </p>
              )}
              {loc.owner_phone && (
                <p style={{ margin: '5px 0', color: '#4b5563', fontSize: '14px' }}>
                  📞 {loc.owner_phone}
                </p>
              )}
            </div>

            <div style={{ 
              borderTop: '1px solid #e5e7eb', 
              paddingTop: '10px', 
              marginTop: '10px',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <a 
                href={`/admin/powerbanks?location=${loc.id}`}
                style={{ 
                  color: '#2563eb', 
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                View Power Banks →
              </a>
              {!loc.latitude && !loc.longitude && (
                <a 
                  href={`/admin/edit-coordinates?location=${loc.id}`}
                  style={{ 
                    color: '#d97706', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Add Coordinates →
                </a>
              )}
            </div>
          </div>
        ))
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Admin</a>
      </div>
    </main>
  );
}
