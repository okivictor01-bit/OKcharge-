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
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    // 3. Fetch Rentals for Revenue and Active Count
    const { data: rentalsData } = await supabase
      .from('rentals')
      .select('amount_paid, status, ticket_code, customer_name, created_at, locations(name)')
      .order('created_at', { ascending: false })
      .limit(10); // Get last 10 for recent transactions

    // Calculate totals
    let totalRevenue = 0;
    let activeRentals = 0;

    if (rentalsData) {
      rentalsData.forEach((r: any) => {
        if (r.status === 'paid' || r.status === 'active' || r.status === 'completed') {
          totalRevenue += r.amount_paid || 0;
        }
        if (r.status === 'active') {
          activeRentals += 1;
        }
      });
    }

    setStats({
      totalRevenue,
      activeRentals,
      totalLocations: locationsCount || 0,
      totalPowerBanks: totalPB,
      availablePowerBanks: availablePB
    });

    setRecentTransactions(rentalsData || []);
    setLoading(false);
  };

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

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '15px', 
        marginBottom: '30px' 
      }}>
        <div style={{ ...statCardStyle, borderLeft: '4px solid #10b981' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Total Revenue</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>₦{stats.totalRevenue.toLocaleString()}</h2>
        </div>
        
        <div style={{ ...statCardStyle, borderLeft: '4px solid #3b82f6' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Active Rentals</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{stats.activeRentals}</h2>
        </div>

        <div style={{ ...statCardStyle, borderLeft: '4px solid #8b5cf6' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Locations</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{stats.totalLocations}</h2>
        </div>

        <div style={{ ...statCardStyle, borderLeft: '4px solid #f59e0b' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Available PBs</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{stats.availablePowerBanks} <span style={{fontSize: '14px', color: '#94a3b8'}}>/ {stats.totalPowerBanks}</span></h2>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Recent Transactions</h2>
          <button 
            onClick={fetchDashboardData}
            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
          >
            🔄 Refresh
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No transactions yet.
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
                {recentTransactions.map((tx) => (
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
