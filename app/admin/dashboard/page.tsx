"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLocations: 0,
    totalOwners: 0,
    totalPowerBanks: 0,
    activeRentals: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/admin-login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/auth/login');
        return;
      }

      // Load stats
      await loadStats();
      setLoading(false);
    };

    checkAuth();
  }, []);

  const loadStats = async () => {
    const { count: locationsCount } = await supabase.from('locations').select('*', { count: 'exact', head: true });
    const { count: ownersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'owner');
    const { count: powerBanksCount } = await supabase.from('power_banks').select('*', { count: 'exact', head: true });
    const { count: activeCount } = await supabase.from('rentals').select('*', { count: 'exact', head: true }).eq('status', 'active');

    setStats({
      totalLocations: locationsCount || 0,
      totalOwners: ownersCount || 0,
      totalPowerBanks: powerBanksCount || 0,
      activeRentals: activeCount || 0,
      totalRevenue: 0
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/admin-login');
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <main style={{ fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '28px', color: '#0f172a' }}>Admin Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#475569' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          <div onClick={() => router.push('/admin/locations')} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '24px' }}>📍</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Manage Locations</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>{stats.totalLocations} total</p>
              </div>
            </div>
            <span style={{ color: '#94a3b8' }}>→</span>
          </div>

          <div onClick={() => router.push('/admin/owners')} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '24px' }}>👤</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Manage Owners</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>{stats.totalOwners} owners</p>
              </div>
            </div>
            <span style={{ color: '#94a3b8' }}>→</span>
          </div>

          <div onClick={() => router.push('/staff/dashboard')} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '24px' }}></span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Manage Staff</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>View & manage staff accounts</p>
              </div>
            </div>
            <span style={{ color: '#94a3b8' }}>→</span>
          </div>

          <div onClick={() => router.push('/admin/powerbanks')} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '24px' }}>🔋</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Manage Power Banks</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>{stats.totalPowerBanks} power banks</p>
              </div>
            </div>
            <span style={{ color: '#94a3b8' }}>→</span>
          </div>

          <div onClick={() => router.push('/admin/generate-qr')} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '24px' }}>️</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Print QR Codes</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>Generate & print QR codes</p>
              </div>
            </div>
            <span style={{ color: '#94a3b8' }}>→</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Active Rentals</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px', color: '#10b981' }}>{stats.activeRentals}</h2>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Total Locations</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px', color: '#3b82f6' }}>{stats.totalLocations}</h2>
        </div>
      </div>
    </main>
  );
}
