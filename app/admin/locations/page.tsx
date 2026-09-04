"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Location {
  id: string;
  name: string;
  address: string;
  owner_name?: string;
  owner_phone?: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export default function LocationsListPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setLocations(data);
    }
    setLoading(false);
  };

  const handleSuspend = async (locationId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'inactive' ? 'suspended' : 'activated';
    
    const { error } = await supabase
      .from('locations')
      .update({ status: newStatus })
      .eq('id', locationId);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage(`Location ${action} successfully!`);
      fetchLocations(); // Refresh the list
    }
  };

  const handleDelete = async (locationId: string) => {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', locationId);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Location deleted successfully!');
      setConfirmDelete(null);
      fetchLocations(); // Refresh the list
    }
  };

  const cardStyle = {
    padding: '20px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '12px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const badgeStyle = (status: string) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: status === 'active' ? '#dcfce7' : '#fee2e2',
    color: status === 'active' ? '#15803d' : '#b91c1c'
  });

  const buttonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer' as const,
    marginRight: '8px',
    marginBottom: '8px'
  };

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

      {message && (
        <div style={{ 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          backgroundColor: message.includes('Error') ? '#fee2e2' : '#dcfce7',
          color: message.includes('Error') ? '#b91c1c' : '#15803d'
        }}>
          {message}
          <button 
            onClick={() => setMessage('')}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading locations...</p>
      ) : locations.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#666', marginBottom: '15px' }}>No locations yet</p>
          <a href="/admin" style={{ color: '#2563eb', fontWeight: 'bold' }}>Add your first location</a>
        </div>
      ) : (
        locations.map((loc) => (
          <div key={loc.id} style={{ ...cardStyle, opacity: loc.status === 'inactive' ? 0.7 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#1f2937' }}>{loc.name}</h2>
              <span style={badgeStyle(loc.status)}>
                {loc.status === 'active' ? '✓ Active' : '⚠ Suspended'}
              </span>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <p style={{ margin: '5px 0', color: '#4b5563', fontSize: '14px' }}>
                📍 {loc.address}
              </p>
              {loc.owner_name && (
                <p style={{ margin: '5px 0', color: '#4b5563', fontSize: '14px' }}>
                   {loc.owner_name}
                </p>
              )}
              {loc.owner_phone && (
                <p style={{ margin: '5px 0', color: '#4b5563', fontSize: '14px' }}>
                   {loc.owner_phone}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px', marginTop: '15px' }}>
              <button
                onClick={() => handleSuspend(loc.id, loc.status)}
                style={{
                  ...buttonStyle,
                  backgroundColor: loc.status === 'active' ? '#f59e0b' : '#10b981',
                  color: 'white'
                }}
              >
                {loc.status === 'active' ? '⏸ Suspend' : '▶ Activate'}
              </button>

              {confirmDelete === loc.id ? (
                <div style={{ display: 'inline-block' }}>
                  <span style={{ fontSize: '14px', color: '#b91c1c', marginRight: '10px' }}>Are you sure?</span>
                  <button
                    onClick={() => handleDelete(loc.id)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: '#ef4444',
                      color: 'white'
                    }}
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: '#6b7280',
                      color: 'white'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(loc.id)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#ef4444',
                    color: 'white'
                  }}
                >
                  🗑 Delete
                </button>
              )}
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
