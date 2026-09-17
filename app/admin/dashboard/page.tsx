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
    todayRevenue: 0,
    allTimeRevenue: 0,
    sevenDaysRevenue: 0
  });
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | '30days' | 'all'>('today');
  const [sevenDaysData, setSevenDaysData] = useState<any[]>([]);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showCustomRange, setShowCustomRange] = useState(false);

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

      await loadStats();
      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadStats();
    }
  }, [dateFilter]);

  const loadStats = async () => {
    const { count: locationsCount } = await supabase.from('locations').select('*', { count: 'exact', head: true });
    const { count: ownersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'owner');
    const { count: powerBanksCount } = await supabase.from('power_banks').select('*', { count: 'exact', head: true });
    const { count: activeCount } = await supabase.from('rentals').select('*', { count: 'exact', head: true }).eq('status', 'active');

    // Get all rentals
    const { data: allRentals } = await supabase
      .from('rentals')
      .select('amount_paid, status, created_at')
      .in('status', ['returned', 'active'])
      .order('created_at', { ascending: true });

    const rentals = allRentals || [];

    // Calculate today's revenue
    const today = new Date().toISOString().split('T')[0];
    const todaysRentals = rentals.filter(r => r.created_at?.startsWith(today));
    const todayRevenue = todaysRentals.reduce((sum, r) => sum + (r.amount_paid * 0.5), 0);

    // Calculate all-time revenue
    const allTimeRevenue = rentals.reduce((sum, r) => sum + (r.amount_paid * 0.5), 0);

    // Calculate last 7 days revenue
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysRentals = rentals.filter(r => {
      if (!r.created_at) return false;
      const rentalDate = new Date(r.created_at);
      return rentalDate >= sevenDaysAgo;
    });
    const sevenDaysRevenue = sevenDaysRentals.reduce((sum, r) => sum + (r.amount_paid * 0.5), 0);

    // Prepare 7 days chart data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayRentals = rentals.filter(r => r.created_at?.startsWith(dateStr));
      const dayRevenue = dayRentals.reduce((sum, r) => sum + (r.amount_paid * 0.5), 0);
      
      last7Days.push({
        date: dateStr,
        day: dayName,
        revenue: dayRevenue,
        count: dayRentals.length
      });
    }
    setSevenDaysData(last7Days);

    setStats({
      totalLocations: locationsCount || 0,
      totalOwners: ownersCount || 0,
      totalPowerBanks: powerBanksCount || 0,
      activeRentals: activeCount || 0,
      todayRevenue,
      allTimeRevenue,
      sevenDaysRevenue
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/admin-login');
  };

  const getFilteredRevenue = () => {
    switch (dateFilter) {
      case 'today':
        return stats.todayRevenue;
      case '7days':
        return stats.sevenDaysRevenue;
      case '30days':
        // Would need to calculate 30 days
        return stats.sevenDaysRevenue; // Placeholder
      case 'all':
        return stats.allTimeRevenue;
      default:
        return stats.todayRevenue;
    }
  };

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today':
        return "Today's Earnings";
      case '7days':
        return 'Last 7 Days';
      case '30days':
        return 'Last 30 Days';
      case 'all':
        return 'All Time';
      default:
        return "Today's Earnings";
    }
  };

  const maxRevenue = Math.max(...sevenDaysData.map(d => d.revenue), 1);

  if (loading) return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Loading...</div>;

  const filteredRevenue = getFilteredRevenue();

  return (
    <main style={{ fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Admin Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#475569' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          
          <div onClick={() => router.push('/admin/locations')} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '24px' }}></span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Manage Locations</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>{stats.totalLocations} total</p>
              </div>
            </div>
            <span style={{ color: '#94a3b8' }}>→</span>
          </div>

          <div onClick={() => router.push('/admin/owners')} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '24px' }}></span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Manage Owners</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>{stats.totalOwners} owners</p>
              </div>
            </div>
            <span style={{ color: '#94a3b8' }}>→</span>
          </div>

          <div onClick={() => router.push('/admin/staff')} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <span style={{ fontSize: '24px' }}></span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Manage Power Banks</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>{stats.totalPowerBanks} power banks</p>
              </div>
            </div>
            <span style={{ color: '#94a3b8' }}>→</span>
          </div>

          <div onClick={() => router.push('/admin/generate-qr')} style={{ backgroundColor: '#f0f9ff', padding: '20px', borderRadius: '12px', border: '2px solid #3b82f6', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '24px' }}>📱</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#1e3a8a' }}>Generate QR Codes</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#3b82f6' }}>Create new location & power bank codes</p>
              </div>
            </div>
            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>→</span>
          </div>

          <div onClick={() => router.push('/admin/print-all-qr')} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '24px' }}>🖨️</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Print All QR Codes</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>Print all codes on A4 paper</p>
              </div>
            </div>
            <span style={{ color: '#94a3b8' }}>→</span>
          </div>

        </div>
      </div>

      {/* Revenue Card with Date Filter */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Platform Earnings</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>{getDateFilterLabel()} (50% platform share)</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setDateFilter('today')}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: dateFilter === 'today' ? '#10b981' : '#f1f5f9', 
                color: dateFilter === 'today' ? 'white' : '#475569', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              Today
            </button>
            <button 
              onClick={() => setDateFilter('7days')}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: dateFilter === '7days' ? '#3b82f6' : '#f1f5f9', 
                color: dateFilter === '7days' ? 'white' : '#475569', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              7 Days
            </button>
            <button 
              onClick={() => setDateFilter('all')}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: dateFilter === 'all' ? '#8b5cf6' : '#f1f5f9', 
                color: dateFilter === 'all' ? 'white' : '#475569', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              All Time
            </button>
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '48px', color: '#10b981', fontWeight: 'bold' }}>₦{filteredRevenue.toLocaleString()}</h1>
        </div>

        {/* 7 Days Chart */}
        {dateFilter === '7days' && sevenDaysData.length > 0 && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a' }}>Daily Breakdown (Last 7 Days)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '200px', padding: '20px 10px 0 10px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              {sevenDaysData.map((day, index) => {
                const height = (day.revenue / maxRevenue) * 100;
                return (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '100%', 
                      height: `${Math.max(height, 5)}%`, 
                      backgroundColor: day.revenue > 0 ? '#3b82f6' : '#cbd5e1',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease',
                      minHeight: '20px'
                    }}>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>{day.day}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>₦{day.revenue.toFixed(0)}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>{day.count} rentals</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Active Rentals</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px', color: '#3b82f6' }}>{stats.activeRentals}</h2>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Total Locations</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px', color: '#8b5cf6' }}>{stats.totalLocations}</h2>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Total Owners</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px', color: '#f59e0b' }}>{stats.totalOwners}</h2>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Power Banks</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px', color: '#10b981' }}>{stats.totalPowerBanks}</h2>
        </div>
      </div>
    </main>
  );
}
