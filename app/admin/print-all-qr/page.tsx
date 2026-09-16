"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function PrintAllQRPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [powerBanks, setPowerBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: locData } = await supabase.from('locations').select('*').order('location_code');
    const { data: pbData } = await supabase.from('power_banks').select('*, locations(name, location_code)').order('pb_code');
    
    if (locData) setLocations(locData);
    if (pbData) setPowerBanks(pbData);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading QR codes...</div>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Print Button - Hidden when printing */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }} className="no-print">
        <button onClick={handlePrint} style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
           Print All QR Codes
        </button>
        <a href="/admin/dashboard" style={{ padding: '12px 24px', backgroundColor: '#64748b', color: 'white', borderRadius: '8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          ← Back
        </a>
      </div>

      <h1 style={{ fontSize: '24px', marginBottom: '30px' }}>All QR Codes</h1>

      {/* Location QR Codes */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>📍 Location QR Codes (Customer Scanning)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {locations.map((loc) => (
            <div key={loc.id} style={{ border: '2px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center', backgroundColor: 'white' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{loc.name}</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px' }}>{loc.location_code}</p>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://okcharge.pages.dev/rent?location=${loc.location_code}`}
                alt={`${loc.name} QR`}
                style={{ width: '200px', height: '200px' }}
              />
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px' }}>Scan to Rent</p>
            </div>
          ))}
        </div>
      </div>

      {/* Power Bank QR Codes */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>🔋 Power Bank QR Codes (Owner Scanning)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {powerBanks.map((pb) => (
            <div key={pb.id} style={{ border: '2px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center', backgroundColor: 'white' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{pb.pb_code}</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px' }}>
                {pb.locations?.name || 'No location'}
              </p>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://okcharge.pages.dev/owner/pb?code=${pb.pb_code}`}
                alt={`${pb.pb_code} QR`}
                style={{ width: '200px', height: '200px' }}
              />
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px' }}>Scan to Manage</p>
            </div>
          ))}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          h1, h2 {
            page-break-after: avoid;
          }
        }
      `}</style>
    </main>
  );
}
