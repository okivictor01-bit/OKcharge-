"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ManagePowerBanks() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [powerBanks, setPowerBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPB, setNewPB] = useState({ code: '', location_id: '', ownership_type: 'okcharge' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLocations();
    fetchPowerBanks();
  }, []);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, owner_id')
      .eq('status', 'active')
      .order('name');
    if (!error) setLocations(data || []);
  };

  const fetchPowerBanks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('power_banks')
      .select('*, locations(name)')
      .order('created_at', { ascending: false });
    if (!error) setPowerBanks(data || []);
    setLoading(false);
  };

  const handleAddPowerBank = async (e: any) => {
    e.preventDefault();
    setMessage('');

    if (!newPB.code || !newPB.location_id) {
      setMessage('❌ Please fill all required fields');
      return;
    }

    try {
      const { error } = await supabase.from('power_banks').insert({
        pb_code: newPB.code.toUpperCase(),
        location_id: newPB.location_id,
        ownership_type: newPB.ownership_type,
        status: 'available'
      });

      if (error) throw error;

      setMessage('✅ Power bank added successfully!');
      setNewPB({ code: '', location_id: '', ownership_type: 'okcharge' });
      setShowAddForm(false);
      fetchPowerBanks();
    } catch (error: any) {
      setMessage('❌ Error: ' + error.message);
    }
  };

  const handleUpdateStatus = async (pbId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('power_banks')
        .update({ status: newStatus })
        .eq('id', pbId);

      if (error) throw error;
      fetchPowerBanks();
    } catch (error: any) {
      alert('❌ Error updating status: ' + error.message);
    }
  };

  const handleDeletePowerBank = async (pbId: string) => {
    if (!window.confirm('Are you sure you want to delete this power bank?')) return;

    try {
      const { error } = await supabase.from('power_banks').delete().eq('id', pbId);
      if (error) throw error;
      fetchPowerBanks();
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
    }
  };

  const generateQRCode = (pbCode: string) => {
    const qrData = `${window.location.origin}/staff/pb?code=${pbCode}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  if (loading) return <main style={{ padding: '20px', textAlign: 'center' }}>Loading...</main>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Manage Power Banks ({powerBanks.length})</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: showAddForm ? '#ef4444' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add New'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: message.includes('✅') ? '#dcfce7' : '#fee2e2',
          color: message.includes('✅') ? '#15803d' : '#b91c1c'
        }}>
          {message}
        </div>
      )}

      {/* Add New Power Bank Form */}
      {showAddForm && (
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '25px',
          borderRadius: '12px',
          border: '2px solid #bae6fd',
          marginBottom: '25px'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#0369a1', fontSize: '20px' }}>Add New Power Bank</h2>
          <form onSubmit={handleAddPowerBank}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0f172a' }}>
                Power Bank Code *
              </label>
              <input
                type="text"
                placeholder="e.g., OKAK001"
                value={newPB.code}
                onChange={(e) => setNewPB({ ...newPB, code: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0f172a' }}>
                Assign to Location *
              </label>
              <select
                value={newPB.location_id}
                onChange={(e) => setNewPB({ ...newPB, location_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              >
                <option value="">Select Location</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            {/* UPDATED: Ownership Type - Now 50/50 Standard */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0f172a' }}>
                Ownership Type *
              </label>
              <select
                value={newPB.ownership_type}
                onChange={(e) => setNewPB({ ...newPB, ownership_type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: '#f0fdf4'
                }}
              >
                <option value="okcharge">OKcharge Owned (50% Owner / 50% Platform)</option>
              </select>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px', margin: '8px 0 0 0' }}>
                • OKcharge Owned: Platform provides the hardware<br/>
                • Revenue split: 50% to Location Owner, 50% to OKcharge
              </p>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Add Power Bank
            </button>
          </form>
        </div>
      )}

      {/* Power Banks List */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {powerBanks.map((pb) => (
          <div key={pb.id} style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#0f172a' }}>{pb.pb_code}</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                  📍 {pb.locations?.name || 'Unassigned'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  backgroundColor: pb.status === 'available' ? '#dcfce7' :
                    pb.status === 'rented' ? '#dbeafe' :
                      pb.status === 'damaged' ? '#fee2e2' : '#fef3c7',
                  color: pb.status === 'available' ? '#15803d' :
                    pb.status === 'rented' ? '#1d4ed8' :
                      pb.status === 'damaged' ? '#b91c1c' : '#92400e'
                }}>
                  ✓ {pb.status?.charAt(0).toUpperCase() + pb.status?.slice(1)}
                </span>
                <br />
                {/* UPDATED: Badge shows 50/50 */}
                <span style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af'
                }}>
                  50/50 Partnership
                </span>
              </div>
            </div>

            {/* QR Code */}
            <div style={{
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '2px dashed #cbd5e1',
              textAlign: 'center',
              marginBottom: '15px'
            }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>
                📱 Power Bank QR Code
              </p>
              <img
                src={generateQRCode(pb.pb_code)}
                alt="QR Code"
                style={{ width: '200px', height: '200px' }}
              />
              <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Scan to manage this power bank
              </p>
            </div>

            {/* Status Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
              <button
                onClick={() => handleUpdateStatus(pb.id, 'available')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: pb.status === 'available' ? '#10b981' : 'white',
                  color: pb.status === 'available' ? 'white' : '#10b981',
                  border: '2px solid #10b981',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ✓ Available
              </button>
              <button
                onClick={() => handleUpdateStatus(pb.id, 'rented')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: pb.status === 'rented' ? '#3b82f6' : 'white',
                  color: pb.status === 'rented' ? 'white' : '#3b82f6',
                  border: '2px solid #3b82f6',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Rented
              </button>
              <button
                onClick={() => handleUpdateStatus(pb.id, 'damaged')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: pb.status === 'damaged' ? '#ef4444' : 'white',
                  color: pb.status === 'damaged' ? 'white' : '#ef4444',
                  border: '2px solid #ef4444',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ⚠️ Damaged
              </button>
              <button
                onClick={() => handleUpdateStatus(pb.id, 'lost')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: pb.status === 'lost' ? '#f59e0b' : 'white',
                  color: pb.status === 'lost' ? 'white' : '#f59e0b',
                  border: '2px solid #f59e0b',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🔔 Lost
              </button>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => handleDeletePowerBank(pb.id)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🗑️ Delete Power Bank
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
