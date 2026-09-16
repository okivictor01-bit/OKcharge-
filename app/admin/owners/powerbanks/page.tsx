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
  const [allLocations, setAllLocations] = useState<any[]>([]);
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

    // Get owner name
    const { data: ownerData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', ownerId)
      .single();

    if (ownerData) setOwnerName(ownerData.full_name || 'Owner');

    // Get ALL locations (not just owner's)
    const { data: allLocsData } = await supabase
      .from('locations')
      .select('*')
      .order('location_code');

    if (allLocsData) setAllLocations(allLocsData);

    // Get owner's locations
    const { data: locationsData } = await supabase
      .from('locations')
      .select('*')
      .eq('owner_id', ownerId);

    if (locationsData) setLocations(locationsData || []);

    // Get ALL power banks
    const { data: pbData } = await supabase
      .from('power_banks')
      .select('*, locations(name, location_code, owner_id)')
      .order('pb_code');

    if (pbData) {
      // Filter to show only power banks at owner's locations
      const ownerLocationIds = locationsData?.map((loc: any) => loc.id) || [];
      const ownerPowerBanks = pbData.filter((pb: any) => 
        ownerLocationIds.includes(pb.location_id)
      );
      setPowerBanks(ownerPowerBanks);
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

  const handlePrint = (pbCode: string) => {
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

  const handleAssignLocation = async (pbId: string, locationId: string) => {
    const { error } = await supabase
      .from('power_banks')
      .update({ location_id: locationId })
      .eq('id', pbId);

    if (!error) {
      alert('Power bank assigned to location');
      loadData();
    } else {
      alert('Error: ' + error.message);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (!ownerId) return <div style={{ padding: '20px' }}>No owner selected.</div>;

  // Get power banks not assigned to any of owner's locations
  const ownerLocationIds = locations.map((loc: any) => loc.id);
  const unassignedPowerBanks = powerBanks.filter((pb: any) => 
    !ownerLocationIds.includes(pb.location_id)
  );

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 5px 0' }}>Power Banks for {ownerName}</h1>
          <p style={{ color: '#64748b', margin: 0 }}>{powerBanks.length} power bank(s) • {locations.length} location(s)</p>
        </div>
        <button 
          onClick={() => locations.length > 0 ? setShowAddModal(true) : alert('Please create a location first.')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: locations.length > 0 ? '#10b981' : '#94a3b8', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: locations.length > 0 ? 'pointer' : 'not-allowed', 
            fontWeight: 'bold' 
          }}
        >
          + Add Power Bank
        </button>
      </div>

      {/* Show message if no locations */}
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

      {/* Show unassigned power banks */}
      {unassignedPowerBanks.length > 0 && (
        <div style={{ backgroundColor: '#dbeafe', padding: '20px', borderRadius: '12px', border: '2px solid #3b82f6', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1e40af' }}>📦 Power Banks at Other Locations ({unassignedPowerBanks.length})</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {unassignedPowerBanks.map((pb: any) => (
              <div key={pb.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{pb.pb_code}</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                    Currently at: {pb.locations?.name || 'Unknown'} ({pb.locations?.location_code || '---'})
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select 
                    onChange={(e) => {
                      if (e.target.value) handleAssignLocation(pb.id, e.target.value);
                    }}
                    defaultValue=""
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Assign to location...</option>
                    {locations.map((loc: any) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Power Bank Modal */}
      {showAddModal && locations.length > 0 && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', maxWidth: '400px', width: '90%' }}>
            <h2 style={{ marginBottom: '20px' }}>Add New Power Bank</h2>
            <form onSubmit={handleAddPowerBank} style={{ display: 'grid', gap: '15px' }}>
              <input 
                placeholder="Power Bank Code (e.g., PB003)" 
                required 
                value={formData.pbCode} 
                onChange={e => setFormData({...formData, pbCode: e.target.value.toUpperCase()})} 
                style={inputStyle} 
              />
              <select 
                required 
                value={formData.locationId} 
                onChange={e => setFormData({...formData, locationId: e.target.value})} 
                style={inputStyle}
              >
                <option value="">Select Location...</option>
                {locations.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.location_code})</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ ...btnStyle, backgroundColor: '#10b981', flex: 1 }}>Create</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ ...btnStyle, backgroundColor: '#64748b', flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Owner's Power Banks List */}
      {powerBanks.filter((pb: any) => ownerLocationIds.includes(pb.location_id)).length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>No power banks at your locations yet</p>
          {locations.length > 0 ? (
            <p style={{ fontSize: '14px' }}>Click "Add Power Bank" to create one</p>
          ) : (
            <p style={{ fontSize: '14px' }}>Create a location first to get started</p>
          )}
        </div>
      ) : (
        <div>
          <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#0f172a' }}>Power Banks at Your Locations</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            {powerBanks.filter((pb: any) => ownerLocationIds.includes(pb.location_id)).map((pb: any) => (
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
                  <button onClick={() => handlePrint(pb.pb_code)} style={{ padding: '8px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    🖨️ Print
                  </button>
                  <button onClick={() => handleDelete(pb.id)} style={{ padding: '8px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
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
