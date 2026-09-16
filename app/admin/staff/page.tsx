"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminStaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, email:auth.users!inner(email)')
      .eq('role', 'staff')
      .order('created_at', { ascending: false });

    if (data) setStaff(data);
    setLoading(false);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          role: 'staff'
        }
      }
    });

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Staff member created successfully!');
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '' });
      fetchStaff();
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    await supabase.auth.admin.deleteUser(userId);
    alert('Staff member deleted');
    fetchStaff();
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px' }}>Manage Staff Accounts</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Add Staff
        </button>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', maxWidth: '400px', width: '90%' }}>
            <h2 style={{ marginBottom: '20px' }}>Add New Staff</h2>
            <form onSubmit={handleAddStaff} style={{ display: 'grid', gap: '15px' }}>
              <input placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
              <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
              <input type="password" placeholder="Password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={inputStyle} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ ...btnStyle, backgroundColor: '#10b981', flex: 1 }}>Create</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ ...btnStyle, backgroundColor: '#64748b', flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff List */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {staff.length === 0 ? (
          <p>No staff members yet.</p>
        ) : (
          staff.map((member: any) => (
            <div key={member.user_id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{member.full_name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{member.email}</p>
              </div>
              <button onClick={() => handleDelete(member.user_id)} style={{ padding: '8px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin/dashboard" style={{ color: '#2563eb' }}>← Back to Admin Dashboard</a>
      </div>
    </main>
  );
}

const inputStyle = { padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };
const btnStyle = { padding: '12px', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
