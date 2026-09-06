"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalRevenue: 0, activeRentals: 0, totalLocations: 0, totalPowerBanks: 0, availablePowerBanks: 0 });
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ day: string; revenue: number }[]>([]);

  const [filterType, setFilterType] = useState<'today' | 'date' | 'range'>('today');
  const [singleDate, setSingleDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSingleDate(today); setStartDate(today); setEndDate(today);
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/admin-login');
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    const { count: locationsCount } = await supabase.from('locations').select('*', { count: 'exact', head: true });
    const { data: pbData } = await supabase.from('power_banks').select('status');
    const { data: rentalsData } = await supabase.from('rentals').select('amount_paid, status, ticket_code, customer_name, created_at, locations(name)').order('created_at', { ascending: false });

    const totalPB = pbData?.length || 0;
    const availablePB = pbData?.filter((pb: any) => pb.status === 'available').length || 0;
    
    setStats({ totalRevenue: 0, activeRentals: 0, totalLocations: locationsCount || 0, totalPowerBanks: totalPB, availablePowerBanks: availablePB });
    setAllTransactions(rentalsData || []);
    
    generateChartData(rentalsData || []);
    applyFilters(rentalsData || []);
    setLoading(false);
  };

  const generateChartData = (transactions: any[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const chart = last7Days.map(date => {
      const dayRevenue = transactions
        .filter((t: any) => t.created_at.startsWith(date) && ['completed', 'paid', 'active'].includes(t.status))
        .reduce((sum: number, t: any) => sum + (t.amount_paid || 0), 0);
      
      const dayName = new Date(date).toLocaleDateString('en-NG', { weekday: 'short' });
      return { day: dayName, revenue: dayRevenue, fullDate: date };
    });
    setChartData(chart);
  };

  const applyFilters = (transactions: any[]) => {
    let filtered = transactions;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filterType === 'today') {
      filtered = transactions.filter((t: any) => new Date(t.created_at) >= todayStart);
    } else if (filterType === 'date' && singleDate) {
      const sd = new Date(singleDate); sd.setHours(0,0,0,0); const nd = new Date(sd); nd.setDate(nd.getDate()+1);
      filtered = transactions.filter((t: any) => { const c = new Date(t.created_at); return c >= sd && c < nd; });
    } else if (filterType === 'range' && startDate && endDate) {
      const st = new Date(startDate); st.setHours(0,0,0,0); const en = new Date(endDate); en.setHours(23,59,59,999);
      filtered = transactions.filter((t: any) => { const c = new Date(t.created_at); return c >= st && c <= en; });
    }

    setFilteredTransactions(filtered);
    let periodRevenue = 0, periodActive = 0;
    filtered.forEach((t: any) => {
      if (['paid', 'active', 'completed'].includes(t.status)) periodRevenue += t.amount_paid || 0;
      if (t.status === 'active') periodActive += 1;
    });
    setStats(prev => ({ ...prev, totalRevenue: periodRevenue, activeRentals: periodActive }));
  };

  useEffect(() => { if (allTransactions.length > 0) applyFilters(allTransactions); }, [filterType, singleDate, startDate, endDate]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  const getFilterLabel = () => filterType === 'today' ? "Today's Revenue" : filterType === 'date' ? `Revenue for ${singleDate}` : `Revenue (${startDate} to ${endDate})`;

  if (loading) return <main style={{ padding: '20px', textAlign: 'center' }}>Loading dashboard data...</main>;

  const maxChartRevenue = Math.max(...chartData.map(d => d.revenue), 1000);

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
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/admin" style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>+ Add Location</a>
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white', padding: '10px 15px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {/* Quick Navigation */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '12px', color: '#475569' }}>Quick Actions</h2>
        
        <a href="/admin/locations" style={navButtonStyle}>
           Manage Locations <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>{stats.totalLocations} total →</span>
        </a>
        
        <a href="/admin/owners" style={navButtonStyle}>
           Manage Owners <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>→</span>
        </a>

        <a href="/admin/powerbanks" style={navButtonStyle}>
          🔋 Add Power Bank <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>{stats.availablePowerBanks} available →</span>
        </a>

        {/*  NEW PRINT QR LINK */}
        <a href="/admin/print-qr" style={navButtonStyle}>
          🖨️ Print QR Codes <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>→</span>
        </a>

        <a href="/staff" style={navButtonStyle}>
           Staff Dashboard <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>→</span>
        </a>
      </div>

      {/* 7-Day Analytics Chart */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}> Revenue Trend (Last 7 Days)</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', gap: '10px' }}>
          {chartData.map((data, idx) => (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <span style={{ fontSize: '11px', color: '#64748b', marginBottom: '5px' }}>₦{(data.revenue/1000).toFixed(1)}k</span>
              <div style={{ 
                width: '100%', 
                maxWidth: '40px', 
                backgroundColor: '#3b82f6', 
                borderRadius: '4px 4px 0 0', 
                height: `${Math.max((data.revenue / maxChartRevenue) * 100, 2)}%`,
                transition: 'height 0.5s ease'
              }}></div>
              <span style={{ fontSize: '12px', color: '#475569', marginTop: '8px', fontWeight: 'bold' }}>{data.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', textAlign: 'center' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>{getFilterLabel()}</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>₦{stats.totalRevenue.toLocaleString()}</h2>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', textAlign: 'center' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Active Rentals</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{stats.activeRentals}</h2>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6', textAlign: 'center' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Total Locations</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{stats.totalLocations}</h2>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', textAlign: 'center' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Available PBs</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{stats.availablePowerBanks} <span style={{fontSize: '14px', color: '#94a3b8'}}>/ {stats.totalPowerBanks}</span></h2>
        </div>
      </div>

      {/* Filter Section */}
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Filter Transactions</h3>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}><input type="radio" value="today" checked={filterType === 'today'} onChange={(e) => setFilterType(e.target.value as any)} style={{ marginRight: '8px' }} /> Today</label>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}><input type="radio" value="date" checked={filterType === 'date'} onChange={(e) => setFilterType(e.target.value as any)} style={{ marginRight: '8px' }} /> Specific Date</label>
        {filterType === 'date' && <input type="date" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} />}
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}><input type="radio" value="range" checked={filterType === 'range'} onChange={(e) => setFilterType(e.target.value as any)} style={{ marginRight: '8px' }} /> Date Range</label>
        {filterType === 'range' && (<div><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} /><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} /></div>)}
      </div>

      {/* Recent Transactions */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Transactions {filterType !== 'today' && <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>(Filtered)</span>}</h2>
          <button onClick={fetchDashboardData} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>🔄 Refresh</button>
        </div>
        {filteredTransactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No transactions found for this period.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '12px 15px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Ticket</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Customer</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Location</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Amount</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx: any) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#2563eb' }}>{tx.ticket_code}</td>
                    <td style={{ padding: '12px 15px' }}><div>{tx.customer_name || 'N/A'}</div><div style={{ fontSize: '12px', color: '#94a3b8' }}>{formatDate(tx.created_at)}</div></td>
                    <td style={{ padding: '12px 15px', color: '#475569' }}>{tx.locations?.name || 'N/A'}</td>
                    <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>₦{tx.amount_paid?.toLocaleString()}</td>
                    <td style={{ padding: '12px 15px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: tx.status === 'completed' ? '#dcfce7' : tx.status === 'active' ? '#dbeafe' : '#fee2e2', color: tx.status === 'completed' ? '#15803d' : tx.status === 'active' ? '#1d4ed8' : '#b91c1c' }}>{tx.status.toUpperCase()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
