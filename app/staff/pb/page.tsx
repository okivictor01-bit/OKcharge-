"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function StaffPowerBankContent() {
  const searchParams = useSearchParams();
  const pbCode = searchParams.get('code') || '';

  const [pbData, setPbData] = useState<any>(null);
  const [activeRental, setActiveRental] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [ticketCode, setTicketCode] = useState('');

  useEffect(() => {
    if (pbCode) fetchData();
  }, [pbCode]);

  const fetchData = async () => {
    setLoading(true);
    const { data: pb } = await supabase
      .from('power_banks')
      .select('*, locations(name)')
      .eq('pb_code', pbCode)
      .single();

    if (pb) {
      setPbData(pb);
      if (pb.status === 'rented') {
        // Find the active rental linked to this power bank
        const { data: rental } = await supabase
          .from('rentals')
          .select('*')
          .eq('power_bank_id', pb.id)
          .eq('status', 'active')
          .single();
        setActiveRental(rental);
      } else {
        setActiveRental(null);
      }
    }
    setLoading(false);
  };

  const handleRentOut = async () => {
    if (!ticketCode) {
      setMessage('Please enter the customer\'s rental ticket code.');
      return;
    }
    setLoading(true);

    // Find the paid rental with this ticket
    const { data: rental, error: rentalError } = await supabase
      .from('rentals')
      .select('*')
      .eq('ticket_code', ticketCode.toUpperCase())
      .eq('status', 'paid')
      .single();

    if (rentalError || !rental) {
      setMessage('Invalid or unpaid ticket code. Please check and try again.');
      setLoading(false);
      return;
    }

    // Update rental: set to active AND link to this power bank
    const { error: updateError } = await supabase
      .from('rentals')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
        power_bank_id: pbData.id   // <-- THIS IS THE KEY FIX
      })
      .eq('id', rental.id);

    if (!updateError) {
      await supabase
        .from('power_banks')
        .update({ status: 'rented' })
        .eq('id', pbData.id);
      setMessage('✅ Success! Power bank rented out.');
      setTicketCode('');
      fetchData();
    } else {
      setMessage('❌ Error processing rental.');
    }
    setLoading(false);
  };

  const handleReturn = async () => {
    if (!activeRental) {
      setMessage('No active rental found. Please refresh.');
      return;
    }
    setLoading(true);

    const { error: rentalError } = await supabase
      .from('rentals')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', activeRental.id);

    const { error: pbError } = await supabase
      .from('power_banks')
      .update({ status: 'available' })
      .eq('id', pbData.id);

    if (rentalError || pbError) {
      setMessage(' Error completing return.');
    } else {
      setMessage('✅ Success! Power bank returned and is now available.');
      setActiveRental(null);
      fetchData();
    }
    setLoading(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    await supabase
      .from('power_banks')
      .update({ status: newStatus })
      .eq('id', pbData.id);
    setMessage(`⚠️ Power bank marked as ${newStatus}.`);
    fetchData();
    setLoading(false);
  };

  if (loading && !pbData) return <main style={{padding: '20px', textAlign: 'center'}}>Loading...</main>;
  if (!pbData) return <main style={{padding: '20px', textAlign: 'center'}}>Power Bank <strong>{pbCode}</strong> not found.</main>;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available': return '#22c55e';
      case 'rented': return '#3b82f6';
      case 'damaged': return '#ef4444';
      case 'lost': return '#f97316';
      default: return '#6b7280';
    }
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '32px', margin: '0', color: '#0f172a' }}>{pbCode}</h1>
        <span style={{
          display: 'inline-block',
          marginTop: '10px',
          padding: '8px 20px',
          borderRadius: '20px',
          backgroundColor: getStatusColor(pbData.status),
          color: 'white',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fontSize: '14px'
        }}>
          {pbData.status}
        </span>
        <p style={{ color: '#64748b', marginTop: '10px', fontSize: '16px' }}>📍 {pbData.locations?.name}</p>
      </div>

      {message && (
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: message.includes('Success') ? '#dcfce7' : '#fee2e2',
          color: message.includes('Success') ? '#15803d' : '#b91c1c',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          {message}
        </div>
      )}

      {pbData.status === 'available' && (
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, textAlign: 'center' }}>Rent Out</h3>
          <input
            type="text"
            placeholder="Enter Customer Ticket (e.g., RNT-BL2UUM)"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value)}
            style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', textAlign: 'center', textTransform: 'uppercase', boxSizing: 'border-box' }}
          />
          <button
            onClick={handleRentOut}
            disabled={loading}
            style={{ width: '100%', padding: '15px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'Processing...' : 'Confirm Handover'}
          </button>
        </div>
      )}

      {pbData.status === 'rented' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {activeRental && (
            <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Active Rental</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>{activeRental.ticket_code}</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                 {activeRental.customer_name || 'Customer'} • {activeRental.duration_hours || '?'} hrs
              </p>
            </div>
          )}
          <button
            onClick={handleReturn}
            disabled={loading}
            style={{ width: '100%', padding: '18px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ✅ Confirm Return
          </button>
          <button
            onClick={() => handleStatusChange('damaged')}
            disabled={loading}
            style={{ width: '100%', padding: '15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ⚠️ Report Damage
          </button>
          <button
            onClick={() => handleStatusChange('lost')}
            disabled={loading}
            style={{ width: '100%', padding: '15px', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
             Mark Lost
          </button>
        </div>
      )}

      {(pbData.status === 'damaged' || pbData.status === 'lost') && (
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fee2e2', borderRadius: '12px', border: '1px solid #fca5a5' }}>
          <p style={{ fontSize: '16px', marginBottom: '15px' }}>This power bank is currently marked as <strong>{pbData.status.toUpperCase()}</strong>.</p>
          <button
            onClick={() => handleStatusChange('available')}
            disabled={loading}
            style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Mark as Available Again
          </button>
        </div>
      )}

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <a href="/admin" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '16px' }}>← Back to Admin Dashboard</a>
      </div>
    </main>
  );
}

export default function StaffPowerBankPage() {
  return (
    <Suspense fallback={<main style={{padding: '20px', textAlign: 'center'}}>Loading...</main>}>
      <StaffPowerBankContent />
    </Suspense>
  );
}
