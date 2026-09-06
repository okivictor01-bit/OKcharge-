"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLocations() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLocations(); }, []);

  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error) setLocations(data || []);
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const { error } = await supabase
      .from('locations')
      .update({ status: newStatus })
      .eq('id', id);
      
    if (!error) fetchLocations();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure? This will delete the location AND all power banks assigned to it.')) return;

    // 1. First, delete all power banks at this location to avoid foreign key errors
    await supabase.from('power_banks').delete().eq('location_id', id);
    
    // 2. Then, delete the location itself
    const { error } = await supabase.from('locations').delete().eq('id', id);
    
    if (!error) fetchLocations();
    else alert('Error deleting location: ' + error.message);
  };

  if (loading) return <main style={{ padding: '20px', textAlign: 'center' }}>Loading locations...</main>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>All Locations ({locations.length})</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/admin/print-qr" style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>🖨️ Print QRs</a>
          <a href="/admin" style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>+ Add New</a>
        </div>
      </div>

      {locations.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>No locations found.</p>
      ) : (
        locations.map((loc) => (
          <div key={loc.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>{loc.name}</h2>
              <span style={{ 
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                backgroundColor: loc.status === 'active' ? '#dcfce7' : '#fee2e2',
                color: loc.status === 'active' ? '#15803d' : '#b91c1c'
              }}>
                {loc.status === 'active' ? '✓ Active' : '⚠ Suspended'}
              </span>
            </div>
            
            <p style={{ margin: '5px 0', color: '#475569', fontSize: '14px' }}>📍 {loc.address}</p>
            <p style={{ margin: '5px 0', color: '#64748b', fontSize: '14px' }}>👤 {loc.contact_name || 'N/A'} • 📞 {loc.contact_phone || 'N/A'}</p>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
              <button 
                onClick={() => handleToggleStatus(loc.id, loc.status)}
                style={{ 
                  padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                  backgroundColor: loc.status === 'active' ? '#f59e0b' : '#10b981', color: 'white' 
                }}
              >
                {loc.status === 'active' ? '⏸ Suspend' : '▶ Activate'}
              </button>
              
              <button 
                onClick={() => handleDelete(loc.id)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
              >
                🗑 Delete
              </button>

              <a href={`/admin/powerbanks?location=${loc.id}`} style={{ marginLeft: 'auto', color: '#2563eb', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', alignSelf: 'center' }}>
                Manage Power Banks →
              </a>
            </div>
          </div>
        ))
      )}
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin/dashboard" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Dashboard</a>
      </div>
    </main>
  );
}
