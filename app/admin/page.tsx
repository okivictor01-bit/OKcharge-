"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    owner_name: '',
    owner_phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase
      .from('locations')
      .insert([
        {
          name: formData.name,
          address: formData.address,
          owner_name: formData.owner_name,
          owner_phone: formData.owner_phone,
          status: 'active',
          is_visible_on_map: true
        }
      ])
      .select();

    if (error) {
      setMessage('❌ Error: ' + error.message);
    } else {
      setMessage('✅ Success! "' + formData.name + '" has been added.');
      setFormData({ name: '', address: '', owner_name: '', owner_phone: '' });
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box' as const
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🔋 Add New Location</h1>
      
      {message && (
        <div style={{ 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          backgroundColor: message.includes('Success') ? '#dcfce7' : '#fee2e2',
          color: message.includes('Success') ? '#15803d' : '#b91c1c'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Location Name *</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g., ABC Lounge"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Address *</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g., 123 Main St, Akure"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Owner Name</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g., John Doe"
          value={formData.owner_name}
          onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Owner Phone</label>
        <input
          style={inputStyle}
          type="tel"
          placeholder="e.g., 08012345678"
          value={formData.owner_phone}
          onChange={(e) => setFormData({...formData, owner_phone: e.target.value})}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading ? '#999' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Saving...' : 'Save Location'}
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Home</a>
      </div
</think>

Excellent choice! Let's build a simple, mobile-friendly Admin page so you can add "ABC Lounge" directly from your phone.

We will do this in **2 quick steps**.

---

### 🔧 Step 1: Allow Adding Locations in Supabase
Right now, your database is locked down for security. We need to tell it to allow adding new locations.

1. Go to your **Supabase Dashboard**.
2. Tap **SQL Editor** on the left.
3. Tap **New query**.
4. Paste this exact code and tap **Run**:

```sql
-- Allow adding new locations (we will secure this with login later)
CREATE POLICY "Allow public insert locations" ON locations
    FOR INSERT WITH CHECK (true);
