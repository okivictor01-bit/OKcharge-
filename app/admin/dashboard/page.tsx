"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeRentals: 0,
    totalLocations: 0,
    totalPowerBanks: 0,
    availablePowerBanks: 0
  });
  
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Date filters
  const [filterType, setFilterType] = useState<'today' | 'date' | 'range'>('today');
  const [singleDate, setSingleDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setSingleDate(today);
    setStartDate(today);
    setEndDate(today);
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    // 1. Fetch Locations Count
    const { count: locationsCount } = await supabase
      .from('locations')
      .select('*', { count: 'exact', head: true });

    // 2. Fetch Power Banks Count & Status
    const { data: pbData } = await supabase
      .from('power_banks')
      .select('status');
    
    const totalPB = pbData?.length || 0;
    const availablePB = pbData?.filter(pb => pb.status === 'available').length || 0;

    // 3. Fetch ALL Rentals (so we can filter them)
    const { data: rentalsData } = await supabase
      .from('rentals')
      .select('amount_paid, status, ticket_code, customer_name, created_at, locations(name)')
      .order('created_at', { ascending: false });

    setAllTransactions(rentalsData || []);
    
    // Set global stats that don't change with filters
    setStats(prev => ({
      ...prev,
      totalLocations: locationsCount || 0,
      totalPowerBanks: totalPB,
      availablePowerBanks: availablePB
    }));

    // Apply initial filter (Today)
    applyFilters(rentalsData || []);
    setLoading(false);
  };

  const applyFilters = (transactions: any[]) => {
    let filtered = transactions;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filterType === 'today') {
      filtered = transactions.filter(t => {
        const createdAt = new Date(t.created_at);
        return createdAt >= todayStart;
      });
    } else if (filterType === 'date' && singleDate) {
      const selectedDate = new Date(singleDate);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filtered = transactions.filter(t => {
        const createdAt = new Date(t.created_at);
        return createdAt >= selectedDate && createdAt < nextDay;
      });
    } else if (filterType === 'range' && startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filtered = transactions.filter(t => {
        const createdAt = new Date(t.created_at);
        return createdAt >= start && createdAt <= end;
      });
    }

    setFilteredTransactions(filtered);
    
    // Calculate Revenue and Active Rentals for the FILTERED period
    let periodRevenue = 0;
    let periodActive = 0;
    
    filtered.forEach((t: any) => {
      if (t.status === 'paid' || t.status === 'active' || t.status === 'completed') {
        periodRevenue += t.amount_paid || 0;
      }
      if (t.status === 'active') {
        periodActive += 1;
      }
    });

    setStats(prev => ({
      ...prev,
      totalRevenue: periodRevenue,
      activeRentals: periodActive
    }));
  };

  // Re-apply filters when filter inputs change
  useEffect(() => {
    if (allTransactions.length > 0) {
      applyFilters(allTransactions);
    }
  }, [filterType, singleDate, startDate, endDate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <main style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p>Loading dashboard data...</p>
      </main>
    );
  }

  const statCardStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    textAlign: 'center' as const
  };

  const navButtonStyle = {
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
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box'
  };

  const getFilterLabel = () => {
    if (filterType === 'today') return "Today's Revenue";
    if (filterType === 'date') return `Revenue for ${singleDate}`;
    if (filterType === 'range') return `Revenue (${startDate} to ${endDate})`;
    return "Revenue";
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Admin Dashboard</h1>
        <a href="/admin" style={{ 
          backgroundColor: '#2563eb', color: 'white', padding: '10px 15px', 
          borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' 
        }}>
          + Add Location
        </a>
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

        <a href="/staff" style={navButtonStyle}>
           Staff Dashboard <span style={{ float: 'right', color: '#64748b', fontWeight: 'normal' }}>→</span>
        </a>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '15px', 
        marginBottom: '30px' 
      }}>
        <div style={{ ...statCardStyle, borderLeft: '4px solid #10b981' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>{getFilterLabel()}</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>₦{stats.totalRevenue.toLocaleString()}</h2>
        </div>
        
        <div style={{ ...statCardStyle, borderLeft: '4px solid #3b82f6' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Active Rentals (Period)</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{stats.activeRentals}</h2>
        </div>

        <div style={{ ...statCardStyle, borderLeft: '4px solid #8b5cf6' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Total Locations</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{stats.totalLocations}</h2>
        </div>

        <div style={{ ...statCardStyle, borderLeft: '4px solid #f59e0b' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Available PBs</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{stats.availablePowerBanks} <span style={{fontSize: '14px', color: '#94a3b8'}}>/ {stats.totalPowerBanks}</span></h2>
        </div>
      </div>

      {/* Filter Section */}
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Filter Transactions</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
            <input
              type="radio"
              value="today"
              checked={filterType === 'today'}
              onChange={(e) => setFilterType(e.target.value as any)}
              style={{ marginRight: '8px' }}
            />
            <span>Today</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
            <input
              type="radio"
              value="date"
              checked={filterType === 'date'}
              onChange={(e) => setFilterType(e.target.value as any)}
              style={{ marginRight: '8px' }}
            />
            <span>Specific Date</span>
          </label>
          
          {filterType === 'date' && (
            <input
              type="date"
              value={singleDate}
              onChange={(e) => setSingleDate(e.target.value)}
              style={inputStyle}
            />
          )}
          
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
            <input
              type="radio"
              value="range"
              checked={filterType === 'range'}
              onChange={(e) => setFilterType(e.target.value as any)}
              style={{ marginRight: '8px' }}
            />
            <span>Date Range</span>
          </label>
          
          {filterType === 'range' && (
            <div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ ...inputStyle, marginBottom: '10px' }}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>
            Transactions {filterType !== 'today' && <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>(Filtered)</span>}
          </h2>
          <button 
            onClick={fetchDashboardData}
            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
          >
            🔄 Refresh
          </button>
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No transactions found for this period.
          </div>
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
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#2563eb' }}>{tx.ticket_code}</td>
                    <td style={{ padding: '12px 15px' }}>
                      <div>{tx.customer_name || 'N/A'}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{formatDate(tx.created_at)}</div>
                    </td>
                    <td style={{ padding: '12px 15px', color: '#475569' }}>{tx.locations?.name || 'N/A'}</td>
                    <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>₦{tx.amount_paid?.toLocaleString()}</td>
                    <td style={{ padding: '12px 15px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: tx.status === 'completed' ? '#dcfce7' : tx.status === 'active' ? '#dbeafe' : '#fee2e2',
                        color: tx.status === 'completed' ? '#15803d' : tx.status === 'active' ? '#1d4ed8' : '#b91c1c'
                      }}>
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Home</a>
      </div>
    </main>
  );
}
