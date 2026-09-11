"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PrintPowerBankQRPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locationId = searchParams.get('location');
  
  const [powerBanks, setPowerBanks] = useState<any[]>([]);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthorized && locationId) {
      fetchData();
    }
  }, [isAuthorized, locationId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/auth/admin-login');
      return;
    }

    // Check if user is admin
    if (user.email === 'tvicglobal@gmail.com') {
      setIsAuthorized(true);
      return;
    }

    // Check if user is staff
    const { data: staffData } = await supabase
      .from('staff')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (staffData) {
      setIsAuthorized(true);
      return;
    }

    // Not authorized
    alert('Access denied. Only admin and staff can print QR codes.');
    router.push('/');
  };

  const fetchData = async () => {
    setLoading(true);
    
    const { data: locData } = await supabase
      .from('locations')
      .select('name')
      .eq('id', locationId)
      .single();
    
    if (locData) {
      setLocationName(locData.name);
    }

    const { data: pbData } = await supabase
      .from('power_banks')
      .select('*')
      .eq('location_id', locationId)
      .order('pb_code');
    
    if (pbData) {
      setPowerBanks(pbData);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isAuthorized) {
    return (
      <main style={{ padding: '20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '18px', color: '#64748b' }}>🔒 Checking authorization...</p>
      </main>
    );
  }

  if (loading) return <main style={{ padding: '20px', textAlign: 'center' }}>Loading...</main>;

  if (!locationId) {
    return (
      <main style={{ padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Select a Location</h1>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>Please select a location to print QR codes.</p>
        <a href="/admin/locations" style={{ 
          display: 'inline-block',
          backgroundColor: '#2563eb', 
          color: 'white', 
          padding: '12px 24px', 
          borderRadius: '8px', 
          textDecoration: 'none',
          fontWeight: 'bold' 
        }}>
          ← Back to Locations
        </a>
      </main>
    );
  }

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }} className="no-print">
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 5px 0' }}> Power Bank QR Codes</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Location: <strong>{locationName}</strong></p>
        </div>
        <button 
          onClick={handlePrint}
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🖨️ Print QR Codes
        </button>
      </div>

      <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '14px' }} className="no-print">
        Print these QR codes and stick them on each power bank. Staff can scan to manage rentals.
      </p>

      {powerBanks.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No power banks found for this location.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {powerBanks.map((pb) => {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://okcharge.pages.dev/staff/pb?code=${pb.pb_code}`;
            
            return (
              <div key={pb.id} style={{ 
                border: '2px solid #e2e8f0', 
                borderRadius: '12px', 
                padding: '20px', 
                textAlign: 'center', 
                backgroundColor: 'white',
                pageBreakInside: 'avoid'
              }}>
                <img 
                  src={qrUrl} 
                  alt={`QR Code for ${pb.pb_code}`}
                  style={{ width: '150px', height: '150px', marginBottom: '15px' }}
                />
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a', fontFamily: 'monospace' }}>{pb.pb_code}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Status: <strong style={{ color: pb.status === 'available' ? '#10b981' : '#3b82f6' }}>
                    {pb.status.toUpperCase()}
                  </strong>
                </p>
                <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                  okcharge.pages.dev/staff/pb?code={pb.pb_code}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }} className="no-print">
        <a href="/admin/locations" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Locations</a>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          main { max-width: 100%; padding: 0; }
        }
      `}</style>
    </main>
  );
}
