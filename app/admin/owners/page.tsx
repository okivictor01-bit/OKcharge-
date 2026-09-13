"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminOwners() {
  const router = useRouter();
  const [owners, setOwners] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    fetchOwners();
    fetchLocations();
  }, []);

  const fetchOwners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('location_owners')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setOwners(data || []);
    setLoading(false);
  };

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, owner_id')
      .eq('status', 'active');
    if (!error) setLocations(data || []);
  };

  // NEW: Reset Password Function
  const handleResetPassword = async (userId: string, businessName: string) => {
    const newPassword = prompt(`Enter a new temporary password for ${businessName} (min 6 characters):`);
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert(' Password must be at least 6 characters.');
      return;
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          user_id: userId,
          new_password: newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      alert(`✅ Password for ${businessName} reset successfully!\n\nNew password: ${newPassword}`);
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
    }
  };

  const handleAssignLocation = async () => {
    if (!selectedOwner || !selectedLocation) {
      alert('Please select both owner and location');
      return;
    }

    const { error } = await supabase
      .from('locations')
      .update({ owner_id: selectedOwner })
      .eq('id', selectedLocation);

    if (!error) {
      alert('✅ Location assigned successfully!');
      setSelectedOwner('');
      setSelectedLocation('');
      fetchLocations();
    } else {
      alert('Error: ' + error.message);
    }
  };

  const handleSetPending = async (ownerId: string) => {
    const { error } = await supabase
      .from('location_owners')
      .update({ status: 'pending' })
      .eq('id', ownerId);

    if (!error) {
      alert('Owner status set to pending');
      fetchOwners();
    } else {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id: string, userId: string) => {
    if (!window.confirm('Delete this owner? This cannot be undone.')) return;

    try {
      const { error: dbError } = await supabase
        .from('location_owners')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) {
        console.warn('Auth deletion warning:', authError.message);
      }

      alert('✅ Owner deleted successfully!');
      fetchOwners();
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
    }
  };

  const getUnassignedLocations = () => {
    return locations.filter(loc => !loc.owner_id);
  };

  if (loading) return <main style={{ padding: '20px', textAlign: 'center' }}>Loading...</main>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Manage Location Owners</h1>
        <a href="/admin/dashboard" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Back to Dashboard
        </a>
      </div>

      {/* Assign Location Section */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', margin: '0 0 20px 0', color: '#0f172a' }}>Assign Location to Owner</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Select Owner</label>
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="">Select Owner</option>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>{owner.business_name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Select Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="">Select Location</option>
              {getUnassignedLocations().map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAssignLocation}
            style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Assign
          </button>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '10px', margin: '10px 0 0 0' }}>
          Note: Only unassigned locations are shown
        </p>
      </div>

      {/* Owners List */}
      <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#0f172a' }}>Registered Owners ({owners.length})</h2>

      {owners.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No owners found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {owners.map((owner) => (
            <div key={owner.id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#0f172a' }}>{owner.business_name}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#64748b' }}>
                    {owner.phone && <span>📞 {owner.phone}</span>}
                    {owner.email && <span>✉️ {owner.email}</span>}
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '14px' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>💰 Revenue Share: {owner.revenue_share || '30'}%</span>
                    <button
                      onClick={() => {/* Edit revenue share logic */}}
                      style={{ marginLeft: '10px', padding: '4px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                  </div>
                  <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                    Registered: {owner.created_at ? new Date(owner.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                  <span style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    backgroundColor: owner.status === 'approved' ? '#dcfce7' : '#fef3c7',
                    color: owner.status === 'approved' ? '#15803d' : '#92400e'
                  }}>
                    ✓ {owner.status === 'approved' ? 'Approved' : 'Pending'}
                  </span>
                  
                  {/* NEW: Reset Password Button */}
                  <button
                    onClick={() => handleResetPassword(owner.user_id, owner.business_name)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    🔑 Reset Password
                  </button>

                  <button
                    onClick={() => handleSetPending(owner.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Set Pending
                  </button>
                </div>
              </div>

              {/* Assigned Locations */}
              {owner.locations && owner.locations.length > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#475569' }}>
                    Assigned Locations ({owner.locations.length}):
                  </h4>
                  {owner.locations.map((loc: any) => (
                    <div key={loc.id} style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px', marginBottom: '8px' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#0f172a' }}>{loc.name}</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#64748b' }}>{loc.address}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
