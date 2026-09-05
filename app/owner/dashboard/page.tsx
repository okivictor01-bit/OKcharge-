"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function OwnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, ownerShare: 0, activeRentals: 0 });
  const router = useRouter();

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    // 1. Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // 2. Fetch Owner Profile
    const { data: ownerData } = await supabase
      .from('location_owners')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!ownerData) {
      // If they logged in but don't have a profile yet
      setLoading(false);
      return;
    }
    setOwner(ownerData);

    // 3. Fetch Locations owned by this user
    const { data: locData } = await supabase
      .from('locations')
      .select('*')
      .eq('owner_id', ownerData.id);
    
    setLocations(locData || []);

    // 4. Fetch Transactions for these locations
    if (locData && locData.length > 0) {
      const locationIds = locData.map(loc => loc.id);
      
      const { data: txData } = await supabase
        .from('rentals')
        .select('*')
        .in('location_id', locationIds)
        .order('created_at', { ascending: false });

      setTransactions(txData || []);

      // 5. Calculate Revenue Share
      let totalRevenue = 0;
      let activeRentals = 0;
      
      (txData || []).forEach((tx: any) => {
        if (tx.status === 'completed' || tx.status === 'paid' || tx.status === 'active') {
          totalRevenue += tx.amount_paid || 0;
        }
        if (tx.status === 'active') {
          activeRentals += 1;
        }
      });

      const sharePercentage = ownerData.revenue_share_percentage || 30;
      const ownerShare = totalRevenue * (sharePercentage / 100);

      setStats({ totalRevenue, ownerShare, activeRentals });
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return <main style={{ padding: '20px', textAlign: 'center' }}>Loading dashboard...</main>;
  }

  if (!owner) {
    return (
      <main style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Profile not found.</h2>
        <p>Please contact support.</p>
        <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 20px' }}>Logout</button>
      </main>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
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

      {/* Revenue Share Card */}
      <div style={{ 
        backgroundColor: '#10b981', padding: '25px', borderRadius: '12px', marginBottom: '25px', color: 'white', textAlign: 'center' 
      }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>Your Earnings ({owner.revenue_share_percentage}% Share)</p>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '36px', fontWeight: 'bold' }}>₦{stats.ownerShare.toLocaleString()}</h2>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Total Location Revenue: ₦{stats.totalRevenue.toLocaleString()}</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Active Rentals</p>
          <h3 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>{stats.activeRentals}</h3>
        </div>
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>My Locations</p>
          <h3 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>{locations.length}</h3>
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
      <h3 style={{ marginBottom: '10px', marginTop: '25px' }}>Recent Transactions</h3>
      {transactions.length === 0 ? (
        <p style={{ color: '#64748b' }}>No transactions yet.</p>
      ) : (
        transactions.slice(0, 5).map(tx => (
          <div key={tx.id} style={{ padding: '15px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{tx.ticket_code}</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>{formatDate(tx.created_at)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#10b981' }}>₦{tx.amount_paid}</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>{tx.status}</p>
            </div>
          </div>
        ))
      )}
    </main>
  );
}
