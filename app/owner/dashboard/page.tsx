"use client";

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// --- LIVE TIMER COMPONENT ---
function RentalTimer({ startedAt, durationHours }: { startedAt: string; durationHours: number }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startedAt).getTime();
      const end = start + (durationHours * 60 * 60 * 1000);
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [startedAt, durationHours]);

  const isExpired = timeLeft === 'EXPIRED';
  const isUrgent = !isExpired && timeLeft.includes('0h');

  return (
    <span style={{ 
      fontWeight: 'bold', 
      color: isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : '#10b981',
      fontFamily: 'monospace',
      fontSize: '14px'
    }}>
      {isExpired ? '⚠️ EXPIRED' : `⏳ ${timeLeft} left`}
    </span>
  );
}

// --- MAIN DASHBOARD ---
function DashboardContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rentals, setRentals] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [activeRentals, setActiveRentals] = useState(0);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    // For now, we'll load all rentals. Later we'll add owner filtering
    const { data, error } = await supabase
      .from('rentals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading rentals:', error);
    } else if (data) {
      setRentals(data);
      
      // Calculate earnings (50% of completed/active rentals)
      const earnings = data
        .filter(r => r.status === 'returned' || r.status === 'active')
        .reduce((sum, r) => sum + (r.amount_paid * 0.5), 0);
      
      setTotalEarnings(earnings);
      
      // Count active rentals
      const active = data.filter(r => r.status === 'active').length;
      setActiveRentals(active);
    }
    
    setLoading(false);
  };

  const filteredRentals = filterDate
    ? rentals.filter(r => r.created_at?.startsWith(filterDate))
    : rentals;

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <main style={{ fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Owner Dashboard</h1>
        <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Welcome back!</p>
      </div>

      {/* Earnings Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#10b981', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '13px', opacity: 0.9 }}>Total Earnings (50%)</p>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>{totalEarnings.toLocaleString()}</h2>
        </div>
        <div style={{ backgroundColor: '#3b82f6', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '13px', opacity: 0.9 }}>Active Rentals</p>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>{activeRentals}</h2>
        </div>
      </div>

      {/* Active Rentals with Live Timers */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '15px' }}>🔋 Active Rentals (Live Timer)</h3>
        {rentals.filter(r => r.status === 'active').length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
            No power banks currently rented out.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {rentals.filter(r => r.status === 'active').map((rental) => (
              <div key={rental.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ color: '#0f172a' }}>{rental.customer_name}</strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{rental.ticket_code}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>{rental.duration_hours} Hour Rental</span>
                  <RentalTimer startedAt={rental.started_at} durationHours={rental.duration_hours} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#0f172a', margin: 0 }}>📜 Transaction History</h3>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
          />
        </div>
        
        {filteredRentals.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
            No transactions yet.
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            {filteredRentals.map((rental) => (
              <div key={rental.id} style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>{rental.customer_name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {new Date(rental.created_at).toLocaleDateString()} • {rental.ticket_code}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                    Status: <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      backgroundColor: rental.status === 'returned' ? '#dcfce7' : rental.status === 'active' ? '#fef3c7' : '#dbeafe',
                      color: rental.status === 'returned' ? '#15803d' : rental.status === 'active' ? '#b45309' : '#1e40af'
                    }}>
                      {rental.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#10b981' }}>+₦{(rental.amount_paid * 0.5).toFixed(0)}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{rental.duration_hours}h - ₦{rental.amount_paid}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}

export default function OwnerDashboard() {
  return (
    <Suspense fallback={
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        Loading dashboard...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
