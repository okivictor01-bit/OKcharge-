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
  const [newStaff, setNewStaff] = useState({ full_name: '', email: '', temp_password: '' });

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
    if (!error) setStaff(data || []);
    setLoading(false);
  };

  const handleAddStaff = async (e: any) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);
    if (newStaff.temp_password.length < 6) { setMessage('❌ Password must be at least 6 characters.'); setSaving(false); return; }
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
        body: JSON.stringify({ email: newStaff.email, password: newStaff.temp_password, full_name: newStaff.full_name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(`✅ Staff created! Password: ${newStaff.temp_password}`);
      setNewStaff({ full_name: '', email: '', temp_password: '' });
      setShowAddForm(false);
      fetchStaff();
    } catch (error: any) { setMessage('❌ Error: ' + error.message); }
    setSaving(false);
  };

  // NEW: Reset Password Function
  const handleResetPassword = async (userId: string, userName: string) => {
    const newPassword = prompt(`Enter a new temporary password for ${userName} (min 6 characters):`);
    if (!newPassword) return;
    if (newPassword.length < 6) { alert('❌ Password must be at least 6 characters.'); return; }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
        body: JSON.stringify({ user_id: userId, new_password: newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      alert(`✅ Password for ${userName} reset successfully! New password: ${newPassword}`);
    } catch (error: any) { alert('❌ Error: ' + error.message); }
  };

  const handleDeleteStaff = async (id: string, userId: string) => {
    if (!window.confirm('Delete this staff member?')) return;
    try {
      await supabase.from('staff').delete().eq('id', id);
      await supabase.auth.admin.deleteUser(userId);
      fetchStaff();
      alert('✅ Deleted.');
    } catch (error: any) { alert('❌ Error: ' + error.message); }
  };

  const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' as const };
  if (loading) return <main style={{ padding: '20px', textAlign: 'center' }}>Loading...</main>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Manage Staff ({staff.length})</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          {showAddForm ? 'Cancel' : '+ Add New'}
        </button>
      </div>

      {message && <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', backgroundColor: message.includes('✅') ? '#dcfce7' : '#fee2e2', color: message.includes('✅') ? '#15803d' : '#b91c1c' }}>{message}</div>}

      {showAddForm && (
        <div style={{ backgroundColor: '#f0f9ff', padding: '25px', borderRadius: '12px', border: '2px solid #bae6fd', marginBottom: '25px' }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#0369a1' }}>Create Staff Account</h2>
          <form onSubmit={handleAddStaff}>
            <input style={inputStyle} type="text" placeholder="Full Name" value={newStaff.full_name} onChange={(e) => setNewStaff({...newStaff, full_name: e.target.value})} required />
            <input style={inputStyle} type="email" placeholder="Email" value={newStaff.email} onChange={(e) => setNewStaff({...newStaff, email: e.target.value})} required />
            <input style={inputStyle} type="text" placeholder="Temp Password" value={newStaff.temp_password} onChange={(e) => setNewStaff({...newStaff, temp_password: e.target.value})} required />
            <button type="submit" disabled={saving} style={{ width: '100%', padding: '15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {saving ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>
      )}

      {staff.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b' }}>No staff found.</p> : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {staff.map((s) => (
            <div key={s.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{s.full_name}</h3>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>{s.email}</p>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: s.is_active ? '#dcfce7' : '#fee2e2', color: s.is_active ? '#15803d' : '#b91c1c' }}>
                  {s.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => handleResetPassword(s.user_id, s.full_name)} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#f59e0b', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                  🔑 Reset Password
                </button>
                <button onClick={() => handleDeleteStaff(s.id, s.user_id)} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: '30px', textAlign: 'center' }}><a href="/admin/dashboard" style={{ color: '#2563eb' }}>← Back to Dashboard</a></div>
    </main>
  );
}
