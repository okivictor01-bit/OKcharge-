"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminAddLocation() {
  const router = useRouter();
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    state: '',
    city: '',
    town: '',
    contact_name: '',
    contact_phone: '',
    owner_id: ''
  });

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    const { data } = await supabase.from('location_owners').select('id, business_name');
    if (data) setOwners(data);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('locations').insert([{
      ...formData,
      status: 'active',
      is_visible_on_map: true,
      created_at: new Date().toISOString()
    }]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Location added successfully!');
      router.push('/admin/locations');
    }
    setLoading(false);
  };

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
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Add New Location</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Create a new power bank station</p>

      <form onSubmit={handleSubmit}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Location Name *</label>
        <input 
          style={inputStyle}
          type="text"
          placeholder="e.g., J&D Babies Store"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Full Address *</label>
        <textarea 
          style={{...inputStyle, minHeight: '80px'}}
          placeholder="e.g., 89, Oluwatuyi, Ijoka road"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>State *</label>
        <input 
          style={inputStyle}
          type="text"
          placeholder="e.g., Lagos"
          value={formData.state}
          onChange={(e) => setFormData({...formData, state: e.target.value})}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>City *</label>
        <input 
          style={inputStyle}
          type="text"
          placeholder="e.g., Ikeja"
          value={formData.city}
          onChange={(e) => setFormData({...formData, city: e.target.value})}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Town/Area</label>
        <input 
          style={inputStyle}
          type="text"
          placeholder="e.g., Allen Avenue"
          value={formData.town}
          onChange={(e) => setFormData({...formData, town: e.target.value})}
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Contact Person Name</label>
        <input 
          style={inputStyle}
          type="text"
          placeholder="e.g., John Doe"
          value={formData.contact_name}
          onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Contact Phone</label>
        <input 
          style={inputStyle}
          type="tel"
          placeholder="e.g., 08031464603"
          value={formData.contact_phone}
          onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Assign to Owner *</label>
        <select 
          style={inputStyle}
          value={formData.owner_id}
          onChange={(e) => setFormData({...formData, owner_id: e.target.value})}
          required
        >
          <option value="">-- Select Owner --</option>
          {owners.map(owner => (
            <option key={owner.id} value={owner.id}>{owner.business_name}</option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading ? '#999' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create Location'}
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin/locations" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Locations</a>
      </div>
    </main>
  );
}
