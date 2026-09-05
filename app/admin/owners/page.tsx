"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Owner {
  id: string;
  business_name: string;
  phone: string;
  email: string;
  revenue_share_percentage: number;
  status: string;
  created_at: string;
}

interface Location {
  id: string;
  name: string;
  address: string; // <-- Added this to fix the TypeScript error
  owner_id: string | null;
}

export default function ManageOwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch all owners
    const { data: ownersData } = await supabase
      .from('location_owners')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Fetch all locations
    const { data: locationsData } = await supabase
      .from('locations')
      .select('id, name, address, owner_id');

    setOwners(ownersData || []);
    setLocations(locationsData || []);
    setLoading(false);
  };

  const handleApprove = async (ownerId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    
    const { error } = await supabase
      .from('location_owners')
      .update({ status: newStatus })
      .eq('id', ownerId);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage(`Owner ${newStatus === 'approved' ? 'approved' : 'set to pending'} successfully!`);
      fetchData();
    }
  };

  const handleAssignLocation = async () => {
    if (!selectedOwnerId || !selectedLocationId) {
      setMessage('Please select both owner and location');
      return;
    }

    const { error } = await supabase
      .from('locations')
      .update({ owner_id: selectedOwnerId })
      .eq('id', selectedLocationId);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Location assigned successfully!');
      setSelectedOwnerId(null);
      setSelectedLocationId('');
      fetchData();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <main style={{ padding: '20px', textAlign: 'center' }}>Loading...</main>;
  }

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Manage Location Owners</h1>
        <a href="/admin/dashboard" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Back to Dashboard
        </a>
      </div>

      {message && (
        <div style={{ 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          backgroundColor: message.includes('Error') ? '#fee2e2' : '#dcfce7',
          color: message.includes('Error') ? '#b91c1c' : '#15803d'
        }}>
          {message}
          <button onClick={() => setMessage('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Assign Location Section */}
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '15px' }}>Assign Location to Owner</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={selectedOwnerId || ''}
            onChange={(e) => setSelectedOwnerId(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          >
            <option value="">Select Owner</option>
            {owners.map(owner => (
              <option key={owner.id} value={owner.id}>{owner.business_name}</option>
            ))}
          </select>
          
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          >
            <option value="">Select Location</option>
            {locations.filter(loc => !loc.owner_id).map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          
          <button
            onClick={handleAssignLocation}
            style={{ padding: '12px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Assign
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>
          Note: Only unassigned locations are shown
        </p>
      </div>

      {/* Owners List */}
      <h2 style={{ marginBottom: '15px' }}>Registered Owners ({owners.length})</h2>
      
      {owners.length === 0 ? (
        <div style={{ padding: '30px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>
          No owners registered yet.
        </div>
      ) : (
        owners.map(owner => {
          const ownerLocations = locations.filter(loc => loc.owner_id === owner.id);
          
          return (
            <div key={owner.id} style={{ 
              padding: '20px', 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0', 
              borderRadius: '12px', 
              marginBottom: '15px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{owner.business_name}</h3>
                  <p style={{ margin: '3px 0', fontSize: '14px', color: '#64748b' }}>📞 {owner.phone}</p>
                  <p style={{ margin: '3px 0', fontSize: '14px', color: '#64748b' }}>📧 {owner.email}</p>
                  <p style={{ margin: '3px 0', fontSize: '14px', color: '#64748b' }}>
                    💰 Revenue Share: {owner.revenue_share_percentage}%
                  </p>
                  <p style={{ margin: '3px 0', fontSize: '12px', color: '#94a3b8' }}>
                    Registered: {formatDate(owner.created_at)}
                  </p>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: owner.status === 'approved' ? '#dcfce7' : '#fef3c7',
                    color: owner.status === 'approved' ? '#15803d' : '#b45309',
                    marginBottom: '10px'
                  }}>
                    {owner.status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                  </span>
                  
                  <button
                    onClick={() => handleApprove(owner.id, owner.status)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 15px',
                      backgroundColor: owner.status === 'approved' ? '#f59e0b' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer',
                      marginTop: '5px'
                    }}
                  >
                    {owner.status === 'approved' ? 'Set Pending' : 'Approve'}
                  </button>
                </div>
              </div>

              {/* Owner's Locations */}
              {ownerLocations.length > 0 && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '15px' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>
                    Assigned Locations ({ownerLocations.length}):
                  </p>
                  {ownerLocations.map(loc => (
                    <div key={loc.id} style={{ 
                      padding: '8px 12px', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '6px', 
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}>
                      <strong>{loc.name}</strong>
                      <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>{loc.address}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </main>
  );
}
