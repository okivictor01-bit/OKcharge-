"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ManageLocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [formData, setFormData] = useState({
    locationCode: '',
    name: '',
    address: '',
    ownerId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Get all locations
    const { data: locationsData } = await supabase
      .from('locations')
      .select('*, profiles(full_name)')
      .order('location_code');

    if (locationsData) setLocations(locationsData);

    // Get all owners
    const { data: ownersData } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('role', 'owner');

    if (ownersData) setOwners(ownersData);

    setLoading(false);
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('locations')
      .insert({
        location_code: formData.locationCode.toUpperCase(),
        name: formData.name,
        address: formData.address,
        owner_id: formData.ownerId || null
      });

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Location created successfully!');
      setShowAddModal(false);
      setFormData({ locationCode: '', name: '', address: '', ownerId: '' });
      loadData();
    }
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;

    const { error } = await supabase
      .from('locations')
      .update({
        location_code: formData.locationCode.toUpperCase(),
        name: formData.name,
        address: formData.address,
        owner_id: formData.ownerId || null
      })
      .eq('id', editingLocation.id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Location updated successfully!');
      setEditingLocation(null);
      setShowAddModal(false);
      setFormData({ locationCode: '', name: '', address: '', ownerId: '' });
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location? This cannot be undone.')) return;
    
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('Location deleted successfully!');
      loadData();
    } else {
      alert('Error: ' + error.message);
    }
  };

  const openEditModal = (location: any) => {
    setEditingLocation(location);
    setFormData({
      locationCode: location.location_code,
      name: location.name,
      address: location.address || '',
      ownerId: location.owner_id || ''
    });
    setShowAddModal(true);
  };

  const openAddModal = () => {
    setEditingLocation(null);
    setFormData({ locationCode: '', name: '', address: '', ownerId: '' });
    setShowAddModal(true);
  };

  if (loading) return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Loading locations...</div>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', margin: 0 }}>Manage Locations</h1>
        <button 
          onClick={openAddModal}
          style={{ padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >
          + Add Location
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Total Locations</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px', color: '#3b82f6' }}>{locations.length}</h2>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>With Owners</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px', color: '#10b981' }}>{locations.filter(l => l.owner_id).length}</h2>
        </div>
      </div>

      {/* Locations List */}
      {locations.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>No locations yet</p>
          <p style={{ fontSize: '14px' }}>Click "Add Location" to create one</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {locations.map((location) => (
            <div key={location.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '24px' }}>📍</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{location.name}</h3>
                      <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#3b82f6', fontWeight: 'bold' }}>{location.location_code}</p>
                    </div>
                  </div>
                  
                  {location.address && (
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#64748b' }}>
                      📍 {location.address}
                    </p>
                  )}
                  
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                    Owner: {location.profiles?.full_name || 'Not assigned'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => {
                      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://okcharge.pages.dev/rent?location=${location.location_code}`;
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head><title>Print QR - ${location.location_code}</title></head>
                            <body style="text-align: center; padding: 50px;">
                              <h1>Location: ${location.name}</h1>
                              <p style="color: #64748b;">${location.location_code}</p>
                              <img src="${qrUrl}" style="width: 400px; height: 400px;" />
                              <p>Scan to Rent</p>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }}
                    style={{ padding: '8px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    🖨️ Print QR
                  </button>
                  <button 
                    onClick={() => openEditModal(location)}
                    style={{ padding: '8px 15px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(location.id)}
                    style={{ padding: '8px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </h2>
            <form onSubmit={editingLocation ? handleUpdateLocation : handleAddLocation} style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Location Code *</label>
                <input 
                  placeholder="e.g., LAG01" 
                  required 
                  value={formData.locationCode}
                  onChange={e => setFormData({...formData, locationCode: e.target.value.toUpperCase()})}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Location Name *</label>
                <input 
                  placeholder="e.g., Shoprite Akure" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Address</label>
                <input 
                  placeholder="e.g., 123 Main Street" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Assign to Owner</label>
                <select 
                  value={formData.ownerId}
                  onChange={e => setFormData({...formData, ownerId: e.target.value})}
                  style={inputStyle}
                >
                  <option value="">No owner (System managed)</option>
                  {owners.map((owner: any) => (
                    <option key={owner.user_id} value={owner.user_id}>{owner.full_name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ ...btnStyle, backgroundColor: '#10b981', flex: 1 }}>
                  {editingLocation ? 'Update' : 'Create'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingLocation(null);
                  }}
                  style={{ ...btnStyle, backgroundColor: '#64748b', flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin/dashboard" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Admin Dashboard</a>
      </div>
    </main>
  );
}

const inputStyle = { 
  padding: '12px', 
  border: '1px solid #cbd5e1', 
  borderRadius: '6px', 
  fontSize: '14px', 
  width: '100%', 
  boxSizing: 'border-box' as const 
};

const btnStyle = { 
  padding: '12px', 
  color: 'white', 
  border: 'none', 
  borderRadius: '6px', 
  fontWeight: 'bold', 
  cursor: 'pointer' 
};
