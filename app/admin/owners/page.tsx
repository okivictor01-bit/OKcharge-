"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminOwners() {
  const router = useRouter();
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOwners(); }, []);

  const fetchOwners = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('location_owners').select('*').order('created_at', { ascending: false });
    if (!error) setOwners(data || []);
    setLoading(false);
  };

  // NEW: Reset Password Function
  const handleResetPassword = async (userId: string, businessName: string) => {
    const newPassword = prompt(`Enter a new temporary password for ${businessName} (min 6 characters):`);
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
      alert(`✅ Password for ${businessName} reset successfully! New password: ${newPassword}`);
    } catch (error: any) { alert('❌ Error: ' + error.message); }
  };

  const handleDelete = async (id: string, userId: string) => {
    if (!window.confirm('Delete this owner?')) return;
    try {
      await supabase.from('location_owners').delete().eq('id', id);
      await supabase.auth.admin.deleteUser(userId);
      fetchOwners();
      alert('✅ Deleted.');
    } catch (error: any) { alert('❌ Error: ' + error.message); }
  };

  if (loading) return <main style={{ padding: '20px', textAlign: 'center' }}>Loading...</main>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Manage Owners ({owners.length})</h1>
        <a href="/auth/register" style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>+ Add New</a>
      </div>

      {owners.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b' }}>No owners found.</p> : (
        <div style={{ display: 'grid', gap: '1
