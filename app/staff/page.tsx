"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  ticket_code: string;
  customer_name: string;
  customer_phone: string;
  amount_paid: number;
  duration_hours: number;
  status: string;
  created_at: string;
  ended_at: string | null;
}

export default function StaffDashboard() {
  const [scanCode, setScanCode] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  
  // Date filters
  const [filterType, setFilterType] = useState<'today' | 'date' | 'range'>('today');
  const [singleDate, setSingleDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchTransactions();
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setSingleDate(today);
    setStartDate(today);
    setEndDate(today);
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    
    // Fetch all rentals for this location (you can filter by location_id if needed)
    const { data, error } = await supabase
      .from('rentals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data || []);
      applyFilters(data || []);
    }
    setLoading(false);
  };

  const applyFilters = (allTransactions: Transaction[]) => {
    let filtered = allTransactions;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filterType === 'today') {
      // Show only today's completed transactions
      filtered = allTransactions.filter(t => {
        const createdAt = new Date(t.created_at);
        return t.status === 'completed' && createdAt >= todayStart;
      });
    } else if (filterType === 'date' && singleDate) {
      // Filter by single date
      const selectedDate = new Date(singleDate);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filtered = allTransactions.filter(t => {
        const createdAt = new Date(t.created_at);
        return t.status === 'completed' && createdAt >= selectedDate && createdAt < nextDay;
      });
    } else if (filterType === 'range' && startDate && endDate) {
      // Filter by date range
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filtered = allTransactions.filter(t => {
        const createdAt = new Date(t.created_at);
        return t.status === 'completed' && createdAt >= start && createdAt <= end;
      });
    }

    setFilteredTransactions(filtered);
    
    // Calculate earnings
    const totalEarnings = filtered.reduce((sum, t) => sum + (t.amount_paid || 0), 0);
    setTodayEarnings(totalEarnings);
    setTotalTransactions(filtered.length);
  };

  const handleFilterChange = () => {
    applyFilters(transactions);
  };

  // Re-apply filters when filter type or dates change
  useEffect(() => {
    if (transactions.length > 0) {
      applyFilters(transactions);
    }
  }, [filterType, singleDate, startDate, endDate]);

  const handleGoToPB = () => {
    if (scanCode) {
      window.location.href = `/staff/pb?code=${scanCode}`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box' as const
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const,
    marginBottom: '10px'
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '10px', textAlign: 'center' }}>Staff Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: '30px', textAlign: 'center' }}>Manage power bank rentals</p>

      {/* Earnings Summary Card */}
      <div style={{ 
        backgroundColor: '#10b981', 
        padding: '25px', 
        borderRadius: '12px', 
        marginBottom: '25px',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>
          {filterType === 'today' ? "Today's Earnings" : filterType === 'date' ? `Earnings for ${singleDate}` : `Earnings (${startDate} - ${endDate})`}
        </p>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '36px', fontWeight: 'bold' }}>
          ₦{todayEarnings.toLocaleString()}
        </h2>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
          {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''}
        </p>
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
                placeholder="Start Date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={inputStyle}
                placeholder="End Date"
              />
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry Section */}
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
        <h3 style={{ marginTop: 0 }}>Manual Entry</h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>Enter a Power Bank code manually</p>
        <input
          type="text"
          placeholder="e.g., OKJD02"
          value={scanCode}
          onChange={(e) => setScanCode(e.target.value.toUpperCase())}
          style={inputStyle}
        />
        <button onClick={handleGoToPB} style={buttonStyle}>
          Go to Power Bank
        </button>
      </div>

      {/* Transactions History */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ marginBottom: '15px' }}>Transaction History</h3>
        
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Loading transactions...</p>
        ) : filteredTransactions.length === 0 ? (
          <div style={{ 
            padding: '30px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '12px', 
            textAlign: 'center',
            color: '#64748b'
          }}>
            <p>No transactions found for this period.</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              style={{
                backgroundColor: 'white',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '16px' }}>{transaction.ticket_code}</p>
                  <p style={{ margin: '0 0 3px 0', fontSize: '14px', color: '#64748b' }}>
                    👤 {transaction.customer_name || 'N/A'}
                  </p>
                  <p style={{ margin: '0 0 3px 0', fontSize: '14px', color: '#64748b' }}>
                    📞 {transaction.customer_phone || 'N/A'}
                  </p>
                  <p style={{ margin: '0 0 3px 0', fontSize: '14px', color: '#64748b' }}>
                    ⏱️ {transaction.duration_hours || '?'} hours
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                    ₦{transaction.amount_paid?.toLocaleString() || '0'}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: transaction.status === 'completed' ? '#dcfce7' : '#fee2e2',
                    color: transaction.status === 'completed' ? '#15803d' : '#b91c1c'
                  }}>
                    {transaction.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Home</a>
      </div>
    </main>
  );
}
