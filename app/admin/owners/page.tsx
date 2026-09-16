"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminOwnersPage() {
  const router = useRouter();
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'owner')
      .order('created_at', { ascending: false });

    if (data) setOwners(data);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('user_id', id);

    if (!error) {
      setOwners(owners.map(o => o.user_id === id ? { ...o, status: newStatus } : o));
      alert(`Owner ${newStatus} successfully!`);
    } else {
      alert('Error updating status: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this owner? This cannot be undone.')) return;
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', id);

    if (!error) {
      setOwners(owners.filter(o => o.user_id !== id));
      alert('Owner deleted successfully!');
    } else {
      alert('Error deleting owner: ' + error.message);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading owners...</div>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Manage Location Owners</h1>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {owners.length === 0 ? (
          <p>No owners registered yet.</p>
        ) : (
          owners.map((owner) => (
            <div key={owner.user_id} style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{owner.full_name}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{owner.phone}</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Bank: {owner.bank_name || 'Not set'} ({owner.bank_account_number || '---'})</p>
                </div>
                <span style={{
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: owner.status === 'approved' ? '#dcfce7' : owner.status === 'suspended' ? '#fee2e2' : '#fef3c7',
                  color: owner.status === 'approved' ? '#15803d' : owner.status === 'suspended' ? '#b91c1c' : '#b45309'
                }}>
                  {owner.status?.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                {/* NEW: Manage Power Banks Button */}
                <button 
                  onClick={() => router.push(`/admin/owners/${owner.user_id}/powerbanks`)}
                  style={{ padding: '8px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                   Manage Power Banks
                </button>

                {owner.status !== 'approved' && (
                  <button 
                    onClick={() => handleStatusChange(owner.user_id, 'approved')}
                    style={{ padding: '8px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Approve
                  </button>
                )}
                {owner.status !== 'suspended' && (
                  <button 
                    onClick={() => handleStatusChange(owner.user_id, 'suspended')}
                    style={{ padding: '8px 15px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Suspend
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(owner.user_id)}
                  style={{ padding: '8px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin/dashboard" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Admin Dashboard</a>
      </div>
    </main>
  );
}
