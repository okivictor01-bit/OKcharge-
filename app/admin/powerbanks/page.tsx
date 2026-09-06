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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPB, setNewPB] = useState({
    pb_code: '',
    location_id: '',
    ownership_type: 'okcharge' as 'okcharge' | 'owner'
  });

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

  const handleAddPowerBank = async (e: any) => {
    e.preventDefault();
    
    if (!newPB.pb_code || !newPB.location_id) {
      alert('Please fill in all required fields');
      return;
    }

    const { error } = await supabase.from('power_banks').insert([{
      pb_code: newPB.pb_code.toUpperCase(),
      location_id: newPB.location_id,
      ownership_type: newPB.ownership_type,
      status: 'available',
      created_at: new Date().toISOString()
    }]);

    if (!error) {
      alert('Power bank added successfully!');
      setNewPB({ pb_code: '', location_id: '', ownership_type: 'okcharge' });
      setShowAddForm(false);
      fetchPowerBanks();
    } else {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this power bank? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.from('power_banks').delete().eq('id', id);
      
      if (error) {
        alert('Error deleting power bank: ' + error.message);
        console.error('Delete error:', error);
      } else {
        alert('Power bank deleted successfully!');
        fetchPowerBanks(); // Refresh the list
      }
    } catch (err: any) {
      alert('Error deleting power bank: ' + err.message);
      console.error('Delete error:', err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('power_banks')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) {
      fetchPowerBanks();
    } else {
      alert('Error updating status: ' + error.message);
    }
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

  const getOwnershipBadge = (type: string) => {
    if (type === 'owner') {
      return { bg: '#fef3c7', text: '#92400e', label: 'Owner (75/25)' };
    }
    return { bg: '#dbeafe', text: '#1e40af', label: 'OKcharge (40/60)' };
  };

  if (loading) return <main style={{ padding: '20px', textAlign: 'center' }}>Loading power banks...</main>;

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box' as const
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Manage Power Banks ({powerBanks.length})</h1>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 15px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {showAddForm ? 'Cancel' : '+ Add New'}
        </button>
      </div>

      {locationFilter && (
        <div style={{ backgroundColor: '#eff6ff', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#1e40af', fontWeight: 'bold' }}>Filtering by Location ID: {locationFilter}</span>
          <button onClick={() => router.push('/admin/powerbanks')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>Clear Filter</button>
        </div>
      )}

      {/* Add Power Bank Form */}
      {showAddForm && (
        <div style={{ backgroundColor: '#f0f9ff', padding: '25px', borderRadius: '12px', border: '2px solid #bae6fd', marginBottom: '25px' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#0369a1' }}>Add New Power Bank</h2>
          <form onSubmit={handleAddPowerBank}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Power Bank Code *</label>
            <input 
              style={inputStyle}
              type="text"
              placeholder="e.g., OKAK001"
              value={newPB.pb_code}
              onChange={(e) => setNewPB({...newPB, pb_code: e.target.value})}
              required
            />

            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Assign to Location *</label>
            <select 
              style={inputStyle}
              value={newPB.location_id}
              onChange={(e) => setNewPB({...newPB, location_id: e.target.value})}
              required
            >
              <option value="">Select Location</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>

            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Ownership Type *</label>
            <select 
              style={inputStyle}
              value={newPB.ownership_type}
              onChange={(e) => setNewPB({...newPB, ownership_type: e.target.value as 'okcharge' | 'owner'})}
              required
            >
              <option value="okcharge">OKcharge Owned (40% Owner / 60% Platform)</option>
              <option value="owner">Owner Owned (75% Owner / 25% Platform)</option>
            </select>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '-10px', marginBottom: '20px' }}>
              • OKcharge Owned: Platform provides the hardware<br/>
              • Owner Owned: Location partner provides their own power banks
            </p>

            <button 
              type="submit"
              style={{ width: '100%', padding: '15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Add Power Bank
            </button>
          </form>
        </div>
      )}

      {/* Power Banks List */}
      {powerBanks.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>No power banks found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {powerBanks.map((pb) => {
            const statusInfo = getStatusColor(pb.status);
            const ownershipInfo = getOwnershipBadge(pb.ownership_type || 'okcharge');
            
            return (
              <div key={pb.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a', fontFamily: 'monospace' }}>{pb.pb_code}</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>📍 {pb.locations?.name || 'Unassigned'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ 
                      padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold',
                      backgroundColor: statusInfo.bg,
                      color: statusInfo.text
                    }}>
                      {statusInfo.label}
                    </span>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                      backgroundColor: ownershipInfo.bg,
                      color: ownershipInfo.text,
                      marginTop: '5px'
                    }}>
                      {ownershipInfo.label}
                    </span>
                  </div>
                </div>
                
                {/* Status Change Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
                  <button 
                    onClick={() => handleStatusChange(pb.id, 'available')}
                    disabled={pb.status === 'available'}
                    style={{ 
                      padding: '6px 12px', borderRadius: '6px', border: '1px solid #10b981', 
                      backgroundColor: pb.status === 'available' ? '#10b981' : 'white',
                      color: pb.status === 'available' ? 'white' : '#10b981',
                      fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    ✓ Available
                  </button>
                  <button 
                    onClick={() => handleStatusChange(pb.id, 'rented')}
                    disabled={pb.status === 'rented'}
                    style={{ 
                      padding: '6px 12px', borderRadius: '6px', border: '1px solid #3b82f6', 
                      backgroundColor: pb.status === 'rented' ? '#3b82f6' : 'white',
                      color: pb.status === 'rented' ? 'white' : '#3b82f6',
                      fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                     Rented
                  </button>
                  <button 
                    onClick={() => handleStatusChange(pb.id, 'damaged')}
                    disabled={pb.status === 'damaged'}
                    style={{ 
                      padding: '6px 12px', borderRadius: '6px', border: '1px solid #ef4444', 
                      backgroundColor: pb.status === 'damaged' ? '#ef4444' : 'white',
                      color: pb.status === 'damaged' ? 'white' : '#ef4444',
                      fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    ⚠️ Damaged
                  </button>
                  <button 
                    onClick={() => handleStatusChange(pb.id, 'lost')}
                    disabled={pb.status === 'lost'}
                    style={{ 
                      padding: '6px 12px', borderRadius: '6px', border: '1px solid #f59e0b', 
                      backgroundColor: pb.status === 'lost' ? '#f59e0b' : 'white',
                      color: pb.status === 'lost' ? 'white' : '#f59e0b',
                      fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    🚨 Lost
                  </button>
                </div>

                {/* Delete Button */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleDelete(pb.id)}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    🗑 Delete
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
