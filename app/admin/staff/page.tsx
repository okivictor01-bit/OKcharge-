"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminStaffManagement() {
  const router = useRouter();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [newStaff, setNewStaff] = useState({
    full_name: '',
    email: '',
    temp_password: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setStaff(data || []);
    setLoading(false);
  };

  const handleAddStaff = async (e: any) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);

    if (newStaff.temp_password.length < 6) {
      setMessage('Temporary password must be at least 6 characters.');
      setSaving(false);
      return;
    }

    try {
      const supabaseUrl = 'https://zsjmudkesxrlrhtugdon.supabase.co';
      const res = await fetch(`${supabaseUrl}/functions/v1/create-staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newStaff.email,
          password: newStaff.temp_password,
          full_name: newStaff.full_name
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ Staff created! Share this temporary password with them: ${newStaff.temp_password}`);
        setNewStaff({ full_name: '', email: '', temp_password: '' });
        setShowAddForm(false);
        fetchStaff();
      } else {
        setMessage('❌ Error: ' + data.error);
      }
    } catch (error: any) {
      setMessage('❌ Network error: ' + error.message);
    }
    setSaving(false);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('staff').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) fetchStaff();
  };

  const handleDeleteStaff = async (id: string, userId: string) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await supabase.from('staff').delete().eq('id', id);
      await supabase.auth.admin.deleteUser(userId);
      fetchStaff();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' as const };

  if (loading) return <main style={{ padding: '20px', textAlign: 'center' }}>Loading...</main>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Manage OKcharge Staff ({staff.length})</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 15px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
          {showAddForm ? 'Cancel' : '+ Add New Staff'}
        </button>
      </div>

      {message && (
        <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', backgroundColor: message.includes('✅') ? '#dcfce7' : '#fee2e2', color: message.includes('✅') ? '#15803d' : '#b91c1c' }}>
          {message}
        </div>
      )}

      {showAddForm && (
        <div style={{ backgroundColor: '#f0f9ff', padding: '25px', borderRadius: '12px', border: '2px solid #bae6fd', marginBottom: '25px' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#0369a1' }}>Create Internal Staff Account</h2>
          <form onSubmit={handleAddStaff}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Full Name *</label>
            <input style={inputStyle} type="text" placeholder="e.g., John Doe" value={newStaff.full_name} onChange={(e) => setNewStaff({...newStaff, full_name: e.target.value})} required />

            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Email Address *</label>
            <input style={inputStyle} type="email" placeholder="staff@okcharge.ng" value={newStaff.email} onChange={(e) => setNewStaff({...newStaff, email: e.target.value})} required />

            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Temporary Password *</label>
            <input style={inputStyle} type="text" placeholder="At least 6 characters" value={newStaff.temp_password} onChange={(e) => setNewStaff({...newStaff, temp_password: e.target.value})} required />
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '-10px', marginBottom: '20px' }}>The staff member will be forced to change this password on their first login.</p>

            <button type="submit" disabled={saving} style={{ width: '100%', padding: '15px', backgroundColor: saving ? '#999' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              {saving ? 'Creating...' : 'Create Staff Account'}
            </button>
          </form>
        </div>
      )}

      {staff.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>No staff members found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {staff.map((s) => (
            <div key={s.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a' }}>{s.full_name}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>📧 {s.email}</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#2563eb', fontWeight: 'bold' }}>🏢 OKcharge Internal Staff</p>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: s.is_active ? '#dcfce7' : '#fee2e2', color: s.is_active ? '#15803d' : '#b91c1c' }}>
                  {s.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                <button onClick={() => handleToggleActive(s.id, s.is_active)} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: s.is_active ? '#f59e0b' : '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                  {s.is_active ? ' Deactivate' : '▶ Activate'}
                </button>
                <button onClick={() => handleDeleteStaff(s.id, s.user_id)} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin/dashboard" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Dashboard</a>
      </div>
    </main>
  );
}
