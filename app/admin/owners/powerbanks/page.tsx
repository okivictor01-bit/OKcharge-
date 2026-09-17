"use client";

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';

function PowerBanksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ownerId = searchParams.get('ownerId') || '';
  
  const [ownerName, setOwnerName] = useState('Loading...');
  const [powerBanks, setPowerBanks] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ pbCode: '', locationId: '' });

  useEffect(() => {
    if (ownerId) {
      loadData();
    }
  }, [ownerId]);

  const loadData = async () => {
    if (!ownerId) return;

    const { data: ownerData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', ownerId)
      .single();

    if (ownerData) setOwnerName(ownerData.full_name || 'Owner');

    const { data: locationsData } = await supabase
      .from('locations')
      .select('*')
      .eq('owner_id', ownerId);

    if (locationsData) setLocations(locationsData || []);

    if (locationsData && locationsData.length > 0) {
      const locationIds = locationsData.map((loc: any) => loc.id);
      const { data: pbData } = await supabase
        .from('power_banks')
        .select('*, locations(name, location_code)')
        .in('location_id', locationIds)
        .order('pb_code');

      if (pbData) setPowerBanks(pbData);
    }

    setLoading(false);
  };

  const handleAddPowerBank = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('power_banks')
      .insert({ 
        pb_code: formData.pbCode.toUpperCase(), 
        location_id: formData.locationId, 
        status: 'available' 
      });

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Power bank created successfully!');
      setShowAddModal(false);
      setFormData({ pbCode: '', locationId: '' });
      loadData();
    }
  };

  const handleDelete = async (pbId: string) => {
    if (!confirm('Are you sure you want to delete this power bank?')) return;
    
    const { error } = await supabase
      .from('power_banks')
      .delete()
      .eq('id', pbId);

    if (!error) {
      alert('Power bank deleted');
      loadData();
    } else {
      alert('Error: ' + error.message);
    }
  };

  const handlePrintSingle = (pbCode: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://okcharge.pages.dev/owner/pb?code=${pbCode}`;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Print QR - ${pbCode}</title></head>
          <body style="text-align: center; padding: 50px;">
            <h1>Power Bank: ${pbCode}</h1>
            <img src="${qrUrl}" style="width: 400px; height: 400px;" />
            <p>Scan to Manage</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handlePrintAll = () => {
    if (powerBanks.length === 0) {
      alert('No power banks to print');
      return;
    }

    const locationName = locations.length > 0 ? locations[0]?.name : 'Location';
    const locationCode = locations.length > 0 ? locations[0]?.location_code : '';

    const qrItems = powerBanks.map(pb => {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://okcharge.pages.dev/owner/pb?code=${pb.pb_code}`;
      return `
        <div class="qr-card">
          <div class="qr-header">${pb.pb_code}</div>
          <img src="${qrUrl}" class="qr-image" />
          <div class="qr-label">${locationName}</div>
          <div class="qr-code">${locationCode}</div>
        </div>
      `;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Power Bank QR Codes - ${locationName}</title>
            <style>
              @page {
                size: A4;
                margin: 15mm;
              }
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #333;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .header p {
                margin: 5px 0 0 0;
                color: #666;
                font-size: 14px;
              }
              .qr-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
              }
              .qr-card {
                border: 2px solid #ddd;
                border-radius: 8px;
                padding: 10px;
                text-align: center;
                page-break-inside: avoid;
              }
              .qr-header {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 8px;
                color: #1e40af;
              }
              .qr-image {
                width: 100%;
                max-width: 150px;
                height: auto;
              }
              .qr-label {
                font-size: 12px;
                margin-top: 8px;
                color: #666;
              }
              .qr-code {
                font-size: 11px;
                color: #999;
                font-weight: bold;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Power Bank QR Codes</h1>
              <p>${locationName} (${locationCode})</p>
              <p>${powerBanks.length} power bank(s)</p>
            </div>
            <div class="qr-grid">
              ${qrItems}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (!ownerId) return <div style={{ padding: '20px' }}>No owner selected.</div>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 5px 0' }}>Power Banks for {ownerName}</h1>
          <p style={{ color: '#64748b', margin: 0 }}>{powerBanks.length} power bank(s) • {locations.length} location(s)</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handlePrintAll}
            disabled={powerBanks.length === 0}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: powerBanks.length > 0 ? '#3b82f6' : '#94a3b8', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: powerBanks.length > 0 ? 'pointer' : 'not-allowed', 
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🖨️ Print All QR Codes
          </button>
          <button 
            onClick={() => locations.length > 0 ? setShowAddModal(true) : alert('Please create a location first.')}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: locations.length > 0 ? '#10b981' : '#94a3b8', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: locations.length > 0 ? 'pointer' : 'not-allowed', 
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            + Add Power Bank
          </button>
        </div>
      </div>

      {locations.length === 0 && (
        <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '12px', border: '2px solid #f59e0b', marginBottom: '20px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', color: '#b45309' }}>⚠️ No Locations Found</p>
          <p style={{ margin: '0 0 15px 0', color: '#92400e' }}>You need to create at least one location before adding power banks.</p>
          <button 
            onClick={() => router.push(`/admin/generate-qr`)}
            style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
             Create Location Now
          </button>
        </div>
      )}

      {powerBanks.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>No power banks yet</p>
          {locations.length > 0 ? (
            <p style={{ fontSize: '14px' }}>Click "Add Power Bank" to create one</p>
          ) : (
            <p style={{ fontSize: '14px' }}>Create a location first to get started</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {powerBanks.map((pb: any) => (
            <div key={pb.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{pb.pb_code}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                  {pb.locations?.name || 'No location'} ({pb.locations?.location_code || '---'})
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
                  Status: <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: pb.status === 'available' ? '#dcfce7' : '#fef3c7',
                    color: pb.status === 'available' ? '#15803d' : '#b45309',
                    fontWeight: 'bold'
                  }}>
                    {pb.status.toUpperCase()}
                  </span>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handlePrintSingle(pb.pb_code)} style={{ padding: '8px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  🖨️ Print
                </button>
                <button onClick={() => handleDelete(pb.id)} style={{ padding: '8px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin/owners" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Owners</a>
      </div>
    </main>
  );
}

export default function OwnerPowerBanksPage() {
  return (
    <Suspense fallback={<div style={{ padding: '20px' }}>Loading...</div>}>
      <PowerBanksContent />
    </Suspense>
  );
}

const inputStyle = { padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };
const btnStyle = { padding: '12px', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
