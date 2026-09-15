"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// --- TIMER COMPONENT ---
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
  const isUrgent = !isExpired && timeLeft.includes('0h') && parseInt(timeLeft) < 30; // Less than 30 mins

  return (
    <span style={{ 
      fontWeight: 'bold', 
      color: isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : '#10b981',
      fontFamily: 'monospace',
      fontSize: '14px'
    }}>
      {isExpired ? '️ EXPIRED' : `⏳ ${timeLeft} left`}
    </span>
  );
}

// --- MAIN DASHBOARD ---
export default function OwnerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<any>(null);
  const [rentals, setRentals] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // 1. Get Current User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      // 2. Get Owner Profile
      const { data: ownerData } = await supabase
        .from('location_owners')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!ownerData) { setLoading(false); return; }
      setOwner(ownerData);

      // 3. Get Owner's Locations
      const { data: locations } = await supabase
        .from('locations')
        .select('id')
        .eq('owner_id', ownerData.id);

      if (!locations || locations.length === 0) { setLoading(false); return; }
      const locationIds = locations.map((loc: any) => loc.id);

      // 4. Get Rentals for these Locations
      const { data: rentalsData } = await supabase
        .from('rentals')
        .select('*')
        .in('location_id', locationIds)
        .order('created_at', { ascending: false });

      if (rentalsData) {
        setRentals(rentalsData);
        
        // Calculate Earnings (50% of completed/active rentals)
        const earnings = rentalsData
          .filter((r: any) => r.status === 'completed' || r.status === 'active')
          .reduce((sum: number, r: any) => sum + (r.amount_paid * 0.5), 0);
        
        setTotalEarnings(earnings);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Dashboard...</div>;
  if (!owner) return <div style={{ padding: '20px', textAlign: 'center' }}>Owner profile not found.</div>;

  return (
    <main style={{ fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Partner Dashboard</h1>
          <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Welcome, {owner.business_name || owner.email}</p>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
      </div>

      {/* Earnings Card */}
      <div style={{ backgroundColor: '#10b981', color: 'white', padding: '25px', borderRadius: '16px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>Total Earnings (50% Share)</p>
        <h2 style={{ margin: 0, fontSize: '36px', fontWeight: 'bold' }}>₦{totalEarnings.toLocaleString()}</h2>
        <p style={{ margin: '10px 0 0 0', fontSize: '12px', opacity: 0.8 }}>Based on {rentals.filter(r => r.status === 'completed' || r.status === 'active').length} successful rentals</p>
      </div>

      {/* Active Rentals with Timers */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '15px' }}>🔋 Active Rentals (Live Timer)</h3>
        {rentals.filter(r => r.status === 'active').length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>No power banks currently rented out.</div>
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
        <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '15px' }}>📜 Transaction History</h3>
        {rentals.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>No transactions yet.</div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            {rentals.map((rental) => (
              <div key={rental.id} style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>{rental.customer_name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(rental.created_at).toLocaleDateString()} • {rental.ticket_code}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#10b981' }}>+₦{(rental.amount_paid * 0.5).toFixed(0)}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>{rental.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}
