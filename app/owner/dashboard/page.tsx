"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function OwnerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to Dark Mode for cafe owners

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Fetch owner profile
    const { data: ownerData, error } = await supabase
      .from('location_owners')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !ownerData) {
      router.push('/auth/login');
      return;
    }

    setOwner(ownerData);

    // Fetch their locations
    const { data: locData } = await supabase
      .from('locations')
      .select('*')
      .eq('owner_id', ownerData.id)
      .order('created_at', { ascending: false });

    if (locData) setLocations(locData);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  // Theme Colors
  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8fafc',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    textMain: isDarkMode ? '#f8fafc' : '#0f172a',
    textMuted: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    accent: '#10b981' // OKcharge Green
  };

  if (loading) {
    return <main style={{ padding: '20px', textAlign: 'center', backgroundColor: theme.bg, minHeight: '100vh', color: theme.textMain }}>Loading your dashboard...</main>;
  }

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', backgroundColor: theme.bg, minHeight: '100vh', transition: 'background-color 0.3s' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: `1px solid ${theme.border}` }}>
        <div>
          <h1 style={{ fontSize: '22px', margin: 0, color: theme.textMain, fontWeight: '800' }}>Partner Dashboard</h1>
          <p style={{ fontSize: '14px', color: theme.textMuted, margin: '5px 0 0 0' }}>Welcome, {owner.business_name || owner.full_name}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{ 
              padding: '8px 12px', 
              backgroundColor: theme.cardBg, 
              color: theme.textMain,
              border: `1px solid ${theme.border}`, 
              borderRadius: '8px', 
              fontSize: '14px', 
              cursor: 'pointer' 
            }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={handleLogout} 
            style={{ 
              padding: '8px 12px', 
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
      </div>

      {/* Status Badge */}
      <div style={{ 
        display: 'inline-block',
        padding: '6px 16px', 
        borderRadius: '20px', 
        fontSize: '13px', 
        fontWeight: 'bold',
        backgroundColor: owner.status === 'approved' ? '#dcfce7' : '#fef3c7',
        color: owner.status === 'approved' ? '#15803d' : '#92400e',
        marginBottom: '25px'
      }}>
        {owner.status === 'approved' ? '✓ Account Active' : ' Account Pending Approval'}
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '16px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>Locations</p>
          <h2 style={{ margin: 0, fontSize: '32px', color: theme.accent, fontWeight: '800' }}>{locations.length}</h2>
        </div>
        <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '16px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>Revenue Share</p>
          <h2 style={{ margin: 0, fontSize: '32px', color: '#f59e0b', fontWeight: '800' }}>{owner.revenue_share || 30}%</h2>
        </div>
      </div>

      {/* Locations List */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px', color: theme.textMain, fontWeight: '700' }}>Your Locations</h2>
        
        {locations.length === 0 ? (
          <div style={{ backgroundColor: theme.cardBg, padding: '30px', borderRadius: '16px', border: `1px solid ${theme.border}`, textAlign: 'center', color: theme.textMuted }}>
            <p style={{ fontSize: '40px', margin: '0 0 10px 0' }}>📍</p>
            <p>No locations assigned yet. Contact admin to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {locations.map((loc) => (
              <div key={loc.id} style={{ 
                backgroundColor: theme.cardBg, 
                padding: '20px', 
                borderRadius: '16px', 
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? '0 4px 6px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: theme.textMain, fontWeight: '700' }}>{loc.name}</h3>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: theme.textMuted }}>📍 {loc.address || 'Address not set'}</p>
                  </div>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    backgroundColor: loc.status === 'active' ? '#dcfce7' : '#fee2e2', 
                    color: loc.status === 'active' ? '#15803d' : '#b91c1c' 
                  }}>
                    {loc.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div style={{ 
        backgroundColor: isDarkMode ? '#1e3a8a' : '#eff6ff', 
        padding: '20px', 
        borderRadius: '16px', 
        border: `1px solid ${isDarkMode ? '#1e40af' : '#bfdbfe'}`,
        textAlign: 'center'
      }}>
        <h3 style={{ marginTop: 0, color: isDarkMode ? '#93c5fd' : '#1e40af', marginBottom: '10px', fontSize: '16px' }}>Need Help?</h3>
        <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: isDarkMode ? '#bfdbfe' : '#475569' }}>
          Contact the OKcharge admin team for payouts or support.
        </p>
        <a 
          href="https://wa.me/2347032385674" 
          target="_blank"
          style={{ 
            display: 'inline-block',
            padding: '10px 20px', 
            backgroundColor: '#25D366', 
            color: 'white', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          💬 Chat on WhatsApp
        </a>
      </div>
    </main>
  );
}
