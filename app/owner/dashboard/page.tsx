"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function OwnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  
  // Global stats (always show current state)
  const [globalStats, setGlobalStats] = useState({ activeRentals: 0, totalLocations: 0 });
  
  // Period stats (changes based on filter)
  const [periodStats, setPeriodStats] = useState({ revenue: 0, share: 0 });

  const [scanCode, setScanCode] = useState('');
  const router = useRouter();

  // Date filters
  const [filterType, setFilterType] = useState<'today' | 'date' | 'range'>('today');
  const [singleDate, setSingleDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { data: ownerData } = await supabase
      .from('location_owners')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!ownerData) {
      setLoading(false);
      return;
    }
    setOwner(ownerData);

    const { data: locData } = await supabase
      .from('locations')
      .select('*')
      .eq('owner_id', ownerData.id);
    
    setLocations(locData || []);
    setGlobalStats(prev => ({ ...prev, totalLocations: locData?.length || 0 }));

    if (locData && locData.length > 0) {
      const locationIds = locData.map(loc => loc.id);
      
      const { data: txData } = await supabase
        .from('rentals')
        .select('*')
        .in('location_id', locationIds)
        .order('created_at', { ascending: false });

      setAllTransactions(txData || []);
      
      // Calculate global active rentals (power banks currently out)
      const activeCount = (txData || []).filter(t => t.status === 'active').length;
      setGlobalStats(prev => ({ ...prev, activeRentals: activeCount }));

      // Apply initial filter (Today)
      applyFilters(txData || [], ownerData.revenue_share_percentage || 30, 'today', singleDate, startDate, endDate);
    }

    setLoading(false);
  };

  const applyFilters = (transactions: any[], sharePercentage: number, type: string, sDate: string, sStart: string, sEnd: string) => {
    let filtered = transactions;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (type === 'today') {
      filtered = transactions.filter(t => {
        const createdAt = new Date(t.created_at);
        return t.status === 'completed' && createdAt >= todayStart;
      });
    } else if (type === 'date' && sDate) {
      const selectedDate = new Date(sDate);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filtered = transactions.filter(t => {
        const createdAt = new Date(t.created_at);
        return t.status === 'completed' && createdAt >= selectedDate && createdAt < nextDay;
      });
    } else if (type === 'range' && sStart && sEnd) {
      const start = new Date(sStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(sEnd);
      end.setHours(23, 59, 59, 999);
      
      filtered = transactions.filter(t => {
        const createdAt = new Date(t.created_at);
        return t.status === 'completed' && createdAt >= start && createdAt <= end;
      });
    }

    setFilteredTransactions(filtered);
    
    // Calculate Revenue for the FILTERED period only
    let periodRevenue = 0;
    filtered.forEach((tx: any) => {
      // We count completed, paid, and active as revenue for the period
      if (tx.status === 'completed' || tx.status === 'paid' || tx.status === 'active') {
        periodRevenue += tx.amount_paid || 0;
      }
    });

    const ownerShare = periodRevenue * (sharePercentage / 100);
    setPeriodStats({ revenue: periodRevenue, share: ownerShare });
  };

  // Re-apply filters when inputs change
  useEffect(() => {
    if (allTransactions.length > 0 && owner) {
      applyFilters(allTransactions, owner.revenue_share_percentage || 30, filterType, singleDate, startDate, endDate);
    }
  }, [filterType, singleDate, startDate, endDate]);

  const handleGoToPB = () => {
    if (scanCode) {
      window.location.href = `/staff/pb?code=${scanCode}`;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return <main style={{ padding: '20px', textAlign: 'center' }}>Loading dashboard...</main>;
  }

  if (!owner) {
    return (
      <main style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Profile not found.</h2>
        <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 20px' }}>Logout</button>
      </main>
    );
  }

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
    if (filterType === 'today') return "Today's Earnings";
    if (filterType === 'date') return `Earnings for ${singleDate}`;
    if (filterType === 'range') return `Earnings (${startDate} to ${endDate})`;
    return "Earnings";
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', margin: 0 }}>Partner Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </div>

      <p style={{ color: '#64748b', marginTop: '-15px', marginBottom: '25px' }}>Welcome, {owner.business_name}</p>

      {/* Revenue Share Card - NOW DYNAMIC */}
      <div style={{ 
        backgroundColor: '#10b981', padding: '25px', borderRadius: '12px', marginBottom: '25px', color: 'white', textAlign: 'center' 
      }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>{getFilterLabel()}</p>
        <p style={{ margin: '0 0 5px 0', fontSize: '12px', opacity: 0.9 }}>({owner.revenue_share_percentage}% Share)</p>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '36px', fontWeight: 'bold' }}>₦{periodStats.share.toLocaleString()}</h2>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Total Location Revenue: ₦{periodStats.revenue.toLocaleString()}</p>
      </div>

      {/* Filter Section */}
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Filter Transactions</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
            <input type="radio" value="today" checked={filterType === 'today'} onChange={(e) => setFilterType(e.target.value as any)} style={{ marginRight: '8px' }} />
            <span>Today</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
            <input type="radio" value="date" checked={filterType === 'date'} onChange={(e) => setFilterType(e.target.value as any)} style={{ marginRight: '8px' }} />
            <span>Specific Date</span>
          </label>
          
          {filterType === 'date' && (
            <input type="date" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} style={inputStyle} />
          )}
          
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
            <input type="radio" value="range" checked={filterType === 'range'} onChange={(e) => setFilterType(e.target.value as any)} style={{ marginRight: '8px' }} />
            <span>Date Range</span>
          </label>
          
          {filterType === 'range' && (
            <div>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ ...inputStyle, marginBottom: '10px' }} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry Section */}
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
        <h3 style={{ marginTop: 0 }}>Manage Power Banks</h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>Enter a Power Bank code to manage</p>
        <input
          type="text"
          placeholder="e.g., OKJD02"
          value={scanCode}
          onChange={(e) => setScanCode(e.target.value.toUpperCase())}
          style={inputStyle}
        />
        <button 
          onClick={handleGoToPB}
          style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Go to Power Bank
        </button>
      </div>

      {/* Global Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Active Rentals (Now)</p>
          <h3 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>{globalStats.activeRentals}</h3>
        </div>
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>My Locations</p>
          <h3 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>{globalStats.totalLocations}</h3>
        </div>
      </div>

      {/* Locations List */}
      <h3 style={{ marginBottom: '10px' }}>My Locations</h3>
      {locations.length === 0 ? (
        <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center', color: '#64748b', marginBottom: '25px' }}>
          No locations linked to your account yet.
        </div>
      ) : (
        locations.map(loc => (
          <div key={loc.id} style={{ padding: '15px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px' }}>
            <strong>{loc.name}</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>{loc.address}</p>
          </div>
        ))
      )}

      {/* Recent Transactions */}
      <h3 style={{ marginBottom: '10px', marginTop: '25px' }}>
        Transaction History {filterType !== 'today' && <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>(Filtered)</span>}
      </h3>
      {filteredTransactions.length === 0 ? (
        <div style={{ padding: '30px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>
          No transactions found for this period.
        </div>
      ) : (
        filteredTransactions.map(tx => (
          <div key={tx.id} style={{ padding: '15px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#2563eb' }}>{tx.ticket_code}</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>{formatDate(tx.created_at)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#10b981' }}>₦{tx.amount_paid}</p>
              <span style={{
                display: 'inline-block',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold',
                backgroundColor: tx.status === 'completed' ? '#dcfce7' : tx.status === 'active' ? '#dbeafe' : '#fee2e2',
                color: tx.status === 'completed' ? '#15803d' : tx.status === 'active' ? '#1d4ed8' : '#b91c1c'
              }}>
                {tx.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))
      )}
    </main>
  );
}
