"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLocations() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('locations')
      .select('*, location_owners(business_name)')
      .order('created_at', { ascending: false });
    
    if (!error) setLocations(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;

    const { error } = await supabase.from('locations').delete().eq('id', id);
    
    if (!error) fetchLocations();
    else alert('Error: ' + error.message);
  };

  if (loading) return <main style={{ padding: '20px', textAlign: 'center' }}>Loading...</main>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Manage Locations ({locations.length})</h1>
        <a 
          href="/admin"
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}
        >
          + Add New
        </a>
      </div>

      {locations.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>No locations found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {locations.map((loc) => (
            <div key={loc.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a' }}>{loc.name}</h3>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>📍 {loc.address}</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                    🏢 Owner: <strong>{loc.location_owners?.business_name || 'Unassigned'}</strong>
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                    State: {loc.state} • City: {loc.city} • Town: {loc.town}
                  </p>
                </div>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  backgroundColor: loc.status === 'active' ? '#dcfce7' : '#fee2e2', 
                  color: loc.status === 'active' ? '#15803d' : '#b91c1c' 
                }}>
                  {loc.status.toUpperCase()}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                <a 
                  href={`/admin/powerbanks?location=${loc.id}`}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '6px', 
                    backgroundColor: '#3b82f6', 
                    color: 'white', 
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  🔋 Manage Power Banks
                </a>
                <a 
                  href={`/admin/print-powerbank-qr?location=${loc.id}`}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '6px', 
                    backgroundColor: '#10b981', 
                    color: 'white', 
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  🖨️ Print PB QR Codes
                </a>
                <button 
                  onClick={() => router.push(`/admin/print-qr?location=${loc.id}`)}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '6px', 
                    border: 'none', 
                    backgroundColor: '#f59e0b', 
                    color: 'white', 
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  📍 Print Location QR
                </button>
                <button 
                  onClick={() => handleDelete(loc.id)}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '6px', 
                    border: 'none', 
                    backgroundColor: '#ef4444', 
                    color: 'white', 
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin/dashboard" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Dashboard</a>
      </div>
    </main>
  );
}
