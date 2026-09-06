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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available': return { bg: '#dcfce7', text: '#15803d', label: '✓ Available' };
      case 'rented': return { bg: '#dbeafe', text: '#1d4ed8', label: '🔵 Rented' };
      case 'damaged': return { bg: '#fee2e2', text: '#b91c1c', label: '⚠️ Damaged' };
      case 'lost': return { bg: '#fef3c7', text: '#92400e', label: '🚨 Lost' };
      default: return { bg: '#f1f5f9', text: '#64748b', label: status };
    }
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
          {powerBanks.map((pb) => {
            const statusInfo = getStatusColor(pb.status);
            return (
              <div key={pb.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a', fontFamily: 'monospace' }}>{pb.pb_code}</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>📍 {pb.locations?.name || 'Unassigned'}</p>
                  </div>
                  <span style={{ 
                    padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold',
                    backgroundColor: statusInfo.bg,
                    color: statusInfo.text
                  }}>
                    {statusInfo.label}
                  </span>
                </div>
                
                {/* Delete Button */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleDelete(pb.id)}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                     Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin/locations" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Locations</a>
      </div>
    </main>
  );
}
