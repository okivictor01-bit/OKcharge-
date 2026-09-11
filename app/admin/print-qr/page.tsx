"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function PrintQRPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchLocations();
    }
  }, [isAuthorized]);

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

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, address')
      .eq('status', 'active')
      .order('name');
      
    if (!error) setLocations(data || []);
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

  if (loading) return <main style={{ padding: '20px', textAlign: 'center' }}>Loading locations...</main>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }} className="no-print">
        <h1 style={{ fontSize: '24px', margin: 0 }}>📍 Print Location QR Codes</h1>
        <button 
          onClick={handlePrint}
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ️ Print Page
        </button>
      </div>

      <p style={{ color: '#64748b', marginBottom: '30px' }} className="no-print">
        Scan these QR codes to go directly to the rent page for each location. Stick these on your power bank stations!
      </p>

      {locations.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>No active locations found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' }}>
          {locations.map((loc) => {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://okcharge.pages.dev/rent?location=${loc.id}`;
            
            return (
              <div key={loc.id} style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '20px', textAlign: 'center', backgroundColor: 'white' }}>
                <img 
                  src={qrUrl} 
                  alt={`QR Code for ${loc.name}`}
                  style={{ width: '200px', height: '200px', marginBottom: '15px' }}
                />
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a' }}>{loc.name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{loc.address}</p>
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                  okcharge.pages.dev/rent?location={loc.id.slice(0, 8)}...
                </p>
              </div>
            );
          })}
        </div>
      )}

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
