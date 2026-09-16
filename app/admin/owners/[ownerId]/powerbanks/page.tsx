"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';

export default function OwnerPowerBanksPage() {
  const params = useParams();
  const router = useRouter();
  const ownerId = params.ownerId as string;
  
  const [ownerName, setOwnerName] = useState('');
  const [powerBanks, setPowerBanks] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ pbCode: '', locationId: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Get owner name
    const { data: ownerData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', ownerId)
      .single();

    if (ownerData) setOwnerName(ownerData.full_name || 'Owner');

    // Get owner's locations
    const { data: locationsData } = await supabase
      .from('locations')
      .select('*')
      .eq('owner_id', ownerId);

    if (locationsData) setLocations(locationsData);

    // Get power banks for owner's locations
    if (locationsData && locationsData.length > 0) {
      const locationIds = locationsData.map(loc => loc.id);
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

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 5px 0' }}>Power Banks for {ownerName}</h1>
          <p style={{ color: '#64748b', margin: 0 }}>{powerBanks.length} power bank(s)</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Add Power Bank
        </button>
      </div>

      {/* Add Power Bank Modal */}
      {showAddModal && (
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
                {locations.map(loc => (
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

      {/* Power Banks List */}
      {powerBanks.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>No power banks yet</p>
          <p style={{ fontSize: '14px' }}>Click "Add Power Bank" to create one</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {powerBanks.map((pb) => (
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
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin/owners" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Owners</a>
      </div>
    </main>
  );
}

const inputStyle = { padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };
const btnStyle = { padding: '12px', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
