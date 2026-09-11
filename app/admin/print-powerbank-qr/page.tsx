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

    if (user.email === 'tvicglobal@gmail.com') {
      setIsAuthorized(true);
      return;
    }

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
          <h1 style={{ fontSize: '24px', margin: '0 0 5px 0' }}>🔋 Power Bank QR Codes</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Location: <strong>{locationName}</strong></p>
          <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '14px' }}>Total: {powerBanks.length} power banks</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handlePrint}
            style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🖨️ Print A4 Sheet
          </button>
          <a 
            href="/admin/locations"
            style={{ backgroundColor: '#6b7280', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
          >
            ← Back
          </a>
        </div>
      </div>

      <div className="no-print" style={{ backgroundColor: '#f0f9ff', padding: '15px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #bae6fd' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>
          💡 <strong>Print Tip:</strong> This page is optimized for A4 paper. Each QR code card will fit perfectly. Use "Fit to page" in your printer settings.
        </p>
      </div>

      {powerBanks.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No power banks found for this location.</p>
      ) : (
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
                    Status: <strong>{pb.status.toUpperCase()}</strong>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        /* Grid layout for QR codes - 3 columns for A4 */
        .qr-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          padding: 20px;
        }

        /* Individual QR card */
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

        /* QR code image */
        .qr-image {
          width: 120px;
          height: 120px;
          margin-bottom: 10px;
        }

        /* QR info section */
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

        /* Print-specific styles for A4 */
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

        /* Responsive for mobile */
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
