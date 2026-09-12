"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function StaffDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<any>(null);
  const [stats, setStats] = useState({
    totalLocations: 0,
    totalOwners: 0,
    totalPowerBanks: 0,
    availablePowerBanks: 0
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/staff-login');
      return;
    }

    const { data: staffData } = await supabase
      .from('staff')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!staffData) {
      await supabase.auth.signOut();
      router.push('/auth/staff-login');
      return;
    }

    setStaff(staffData);
    fetchStats();
    setLoading(false);
  };

  const fetchStats = async () => {
    const { count: locationsCount } = await supabase.from('locations').select('*', { count: 'exact', head: true });
    const { count: ownersCount } = await supabase.from('location_owners').select('*', { count: 'exact', head: true });
    const { data: pbData } = await supabase.from('power_banks').select('status');

    const totalPB = pbData?.length || 0;
    const availablePB = pbData?.filter((pb: any) => pb.status === 'available').length || 0;

    setStats({
      totalLocations: locationsCount || 0,
      totalOwners: ownersCount || 0,
      totalPowerBanks: totalPB,
      availablePowerBanks: availablePB
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/staff-login');
  };

  const handleChangePassword = () => {
    router.push('/staff/change-password');
  };

  if (loading) {
    return <main style={{ padding: '20px', textAlign: 'center' }}>Loading...</main>;
  }

  const navButtonStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '15px 20px',
    marginBottom: '10px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    textDecoration: 'none',
    color: '#0f172a',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'left' as const,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    boxSizing: 'border-box'
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0 }}>Staff Dashboard</h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '5px 0 0 0' }}>Welcome, {staff.full_name}</p>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#ef4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '14px', 
            fontWeight: 'bold', 
            cursor: 'pointer' 
          }}
        >
          Logout
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#475569' }}>Quick Actions</h2>
        
        <a href="/admin/locations" style={navButtonStyle}>
           Manage Locations <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>{stats.totalLocations} total →</span>
        </a>
        
        <a href="/admin/owners" style={navButtonStyle}>
          👤 Manage Owners <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>{stats.totalOwners} total →</span>
        </a>

        <a href="/admin/powerbanks" style={navButtonStyle}>
          🔋 Manage Power Banks <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>{stats.availablePowerBanks} available →</span>
        </a>

        <a href="/admin/print-qr" style={navButtonStyle}>
          📍 Print Location QR Codes <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>→</span>
        </a>

        <a href="/admin/print-powerbank-qr" style={navButtonStyle}>
          🔋 Print Power Bank QR Codes <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>→</span>
        </a>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', textAlign: 'center' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Total Locations</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{stats.totalLocations}</h2>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', textAlign: 'center' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Total Owners</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{stats.totalOwners}</h2>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', textAlign: 'center' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Available PBs</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{stats.availablePowerBanks} <span style={{fontSize: '14px', color: '#94a3b8'}}>/ {stats.totalPowerBanks}</span></h2>
        </div>
      </div>

      {/* Account Settings */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px' }}>🔑 Account Settings</h3>
        <button
          onClick={handleChangePassword}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#6b7280', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '14px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            marginBottom: '10px' 
          }}
        >
          Change Password
        </button>
      </div>

      {/* Quick Help */}
      <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
        <h3 style={{ marginTop: 0, color: '#1e40af', marginBottom: '10px' }}>ℹ️ Quick Help</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#475569', lineHeight: '1.8' }}>
          <li>Manage locations and owners from the dashboard</li>
          <li>Print QR codes for locations and power banks</li>
          <li>Use the Power Bank QR codes to manage rentals at locations</li>
          <li>Contact admin if you need assistance</li>
        </ul>
      </div>
    </main>
  );
}
