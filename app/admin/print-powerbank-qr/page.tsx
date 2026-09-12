"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PrintPowerBankQRPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId = searchParams.get('location');
  
  const [powerBanks, setPowerBanks] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchLocations();
      if (locationId) {
        fetchPowerBanks();
      }
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

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('id, name')
      .eq('status', 'active')
      .order('name');
    
    if (!error && data) {
      setLocations(data);
    }
  };

  const fetchPowerBanks = async () => {
    setLoading(true);
    
    if (locationId) {
      // Get location name
      const { data: locData } = await supabase
        .from('locations')
        .select('name')
        .eq('id', locationId)
        .single();
      
      if (locData) {
        setLocationName(locData.name);
      }

      // Get all power banks for this location
      const { data: pbData, error } = await supabase
        .from('power_banks')
        .select('*')
        .eq('location_id', locationId)
        .order('pb_code');
      
      if (!error && pbData) {
        setPowerBanks(pbData);
      }
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLocationSelect = (locId: string) => {
    router.push(`/admin/print-powerbank-qr?location=${locId}`);
  };

  if (!isAuthorized) {
    return (
      <main style={{ padding: '20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '18px', color: '#64748b' }}>🔒 Checking authorization...</p>
      </main>
    );
  }

  if (loading && locationId && powerBanks.length === 0) {
    return <main style={{ padding: '20px', textAlign: 'center' }}>Loading power banks...</main>;
  }

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }} className="no-print">
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 5px 0' }}> Power Bank QR Codes</h1>
          {locationName && <p style={{ color: '#64748b', margin: 0 }}>Location: <strong>{locationName}</strong></p>}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {powerBanks.length > 0 && (
            <button 
              onClick={handlePrint}
              style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🖨️ Print QR Codes
            </button>
          )}
          <a 
            href="/admin/dashboard"
            style={{ backgroundColor: '#6b7280', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
          >
            ← Back
          </a>
        </div>
      </div>

      {/* Location Selector */}
      {!locationId && (
        <div className="no-print" style={{ backgroundColor: '#f0f9ff', padding: '30px', borderRadius: '12px', border: '2px solid #bae6fd', marginBottom: '30px' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#0369a1' }}>Select a Location</h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>Choose a location to print QR codes for its power banks:</p>
          
          {locations.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No active locations found.</p>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleLocationSelect(loc.id)}
                  style={{
                    padding: '15px 20px',
                    backgroundColor: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#0f172a',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  📍 {loc.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Power Bank QR Codes */}
      {locationId && powerBanks.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
          <p style={{ fontSize: '48px', marginBottom: '15px' }}>📭</p>
          <h3 style={{ color: '#64748b', marginBottom: '10px' }}>No Power Banks Found</h3>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>This location doesn't have any power banks yet.</p>
          <a 
            href="/admin/powerbanks"
            style={{ 
              display: 'inline-block',
              backgroundColor: '#2563eb', 
              color: 'white', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              textDecoration: 'none',
              fontWeight: 'bold' 
            }}
          >
            + Add Power Banks
          </a>
        </div>
      )}

      {powerBanks.length > 0 && (
        <>
          <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '14px' }} className="no-print">
            Print these QR codes and stick them on each power bank. Staff can scan to manage rentals.
          </p>

          <div className="qr-grid">
            {powerBanks.map((pb) => {
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://okcharge.pages.dev/staff/pb?code=${pb.pb_code}`;
              
              return (
                <div key={pb.id} className="qr-card">
                  <img 
                    src={qrUrl} 
                    alt={`QR Code for ${pb.pb_code}`}
                    className="qr-image"
                  />
                  <div className="qr-info">
                    <h3 className="qr-code">{pb.pb_code}</h3>
                    <p className="qr-location">{locationName}</p>
                    <p className="qr-status">
                      Status: <strong>{pb.status?.toUpperCase() || 'AVAILABLE'}</strong>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style jsx global>{`
        .qr-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          padding: 20px;
        }

        .qr-card {
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 15px;
          text-align: center;
          background-color: white;
          page-break-inside: avoid;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .qr-image {
          width: 120px;
          height: 120px;
          margin-bottom: 10px;
        }

        .qr-info {
          width: 100%;
        }

        .qr-code {
          margin: 0 0 5px 0;
          font-size: 16px;
          color: #0f172a;
          font-family: monospace;
          font-weight: bold;
        }

        .qr-location {
          margin: 0 0 5px 0;
          font-size: 12px;
          color: #64748b;
        }

        .qr-status {
          margin: 0;
          font-size: 11px;
          color: #94a3b8;
        }

        .qr-status strong {
          color: #10b981;
        }

        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          body {
            background: white;
            margin: 0;
            padding: 0;
          }

          main {
            max-width: 100%;
            padding: 0;
            margin: 0;
          }

          .no-print {
            display: none !important;
          }

          .qr-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            padding: 0;
          }

          .qr-card {
            border: 1px solid #cbd5e1;
            padding: 10px;
            break-inside: avoid;
          }

          .qr-image {
            width: 100px;
            height: 100px;
          }

          .qr-code {
            font-size: 14px;
          }

          .qr-location {
            font-size: 10px;
          }

          .qr-status {
            font-size: 9px;
          }
        }

        @media screen and (max-width: 768px) {
          .qr-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
        }

        @media screen and (max-width: 480px) {
          .qr-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
        }
      `}</style>
    </main>
  );
}
