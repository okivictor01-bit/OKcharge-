"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminPowerBanks() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationFilter = searchParams.get('location');
  
  const [powerBanks, setPowerBanks] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    fetchLocations();
    fetchPowerBanks(); 
  }, [locationFilter]);

  const fetchLocations = async () => {
    const { data } = await supabase.from('locations').select('id, name').eq('status', 'active');
    if (data) setLocations(data);
  };

  const fetchPowerBanks = async () => {
    setLoading(true);
    let query = supabase.from('power_banks').select('*, locations(name)').order('created_at', { ascending: false });
    
    if (locationFilter) {
      query = query.eq('location_id', locationFilter);
    }

    const { data, error } = await query;
    if (!error) setPowerBanks(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this power bank?')) return;

    const { error } = await supabase.from('power_banks').delete().eq('id', id);
    
    if (!error) fetchPowerBanks();
    else alert('Error deleting power bank: ' + error.message);
  };

  if (loading) return <main style={{ padding: '20px', textAlign: 'center' }}>Loading power banks...</main>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Manage Power Banks ({powerBanks.length})</h1>
        <a href="/admin" style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>+ Add New</a>
      </div>

      {locationFilter && (
        <div style={{ backgroundColor: '#eff6ff', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#1e40af', fontWeight: 'bold' }}>Filtering by Location ID: {locationFilter}</span>
          <button onClick={() => router.push('/admin/powerbanks')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>Clear Filter</button>
        </div>
      )}

      {powerBanks.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>No power banks found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {powerBanks.map((pb) => (
            <div key={pb.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a', fontFamily: 'monospace' }}>{pb.pb_code}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>📍 {pb.locations?.name || 'Unassigned'}</p>
                <span style={{ 
                  display: 'inline-block', marginTop: '5px', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                  backgroundColor: pb.status === 'available' ? '#dcfce7' : pb.status === 'rented' ? '#dbeafe' : '#fee2e2',
                  color: pb.status === 'available' ? '#15803d' : pb.status === 'rented' ? '#1d4ed8' : '#b91c1c'
                }}>
                  {pb.status.toUpperCase()}
                </span>
              </div>
              
              <button 
                onClick={() => handleDelete(pb.id)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
              >
                🗑 Delete
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin/locations" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Locations</a>
      </div>
    </main>
  );
}
