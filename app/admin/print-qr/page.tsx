"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function PrintQRPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [powerBanks, setPowerBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Your actual domain
  const BASE_URL = 'https://okcharge.pages.dev'; 

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data } = await supabase.from('locations').select('id, name').eq('status', 'active');
    if (data) setLocations(data);
  };

  const fetchPowerBanks = async (locationId: string) => {
    setSelectedLocationId(locationId);
    if (!locationId) {
      setPowerBanks([]);
      return;
    }
    
    setLoading(true);
    // Fetch power banks for this location
    const { data } = await supabase
      .from('power_banks')
      .select('pb_code, status')
      .eq('location_id', locationId);
      
    setPowerBanks(data || []);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Print Styles (Only applies when printing) */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            margin: 0; 
            padding: 10mm;
          }
          .no-print { display: none !important; }
          .qr-card { 
            break-inside: avoid; 
            border: 1px solid #000 !important;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* UI Controls (Hidden when printing) */}
      <div className="no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', margin: 0 }}>🖨️ Print Location QR Codes</h1>
          <button onClick={() => router.push('/admin/dashboard')} style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            ← Back to Dashboard
          </button>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', fontSize: '16px' }}>Select Location to Print</label>
          <select
            value={selectedLocationId}
            onChange={(e) => fetchPowerBanks(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '16px', marginBottom: '20px' }}
          >
            <option value="">-- Choose a location --</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>

          {powerBanks.length > 0 && (
            <button 
              onClick={handlePrint}
              style={{ width: '100%', padding: '15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ️ Print A4 Sheet ({powerBanks.length} Codes)
            </button>
          )}
          
          {powerBanks.length === 0 && selectedLocationId && !loading && (
            <p style={{ color: '#ef4444', textAlign: 'center' }}>No power banks found for this location. Please add them first.</p>
          )}
        </div>
      </div>

      {/* Printable Area (A4 Grid) */}
      <div id="printable-area">
        {selectedLocationId && powerBanks.length > 0 && (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', display: 'none' }}>
              {locations.find(l => l.id === selectedLocationId)?.name} - Power Bank QR Codes
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '15px',
              padding: '10px'
            }}>
              {powerBanks.map((pb) => {
                const qrData = `${BASE_URL}/staff/pb?code=${pb.pb_code}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
                
                return (
                  <div key={pb.id} className="qr-card" style={{ 
                    border: '2px dashed #cbd5e1', 
                    borderRadius: '12px', 
                    padding: '15px', 
                    textAlign: 'center',
                    backgroundColor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={qrUrl} 
                      alt={`QR for ${pb.pb_code}`} 
                      style={{ width: '120px', height: '120px', marginBottom: '10px' }} 
                    />
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a', fontFamily: 'monospace' }}>
                      {pb.pb_code}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      Scan to Manage
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#94a3b8' }}>
                      {locations.find(l => l.id === selectedLocationId)?.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
