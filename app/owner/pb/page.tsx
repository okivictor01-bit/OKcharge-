"use client";

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function PowerBankContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pbCode = searchParams.get('code');
  
  const [powerBank, setPowerBank] = useState<any>(null);
  const [ticketCode, setTicketCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  useEffect(() => {
    if (pbCode) {
      fetchPowerBank(pbCode);
    }
  }, [pbCode]);

  const fetchPowerBank = async (code: string) => {
    setLoading(true);
    // Fetch PB details AND its location info
    const { data, error } = await supabase
      .from('power_banks')
      .select('*, locations(name, owner_id)')
      .eq('pb_code', code)
      .single();

    if (error) {
      setMessage('Power bank not found');
      setMessageType('error');
    } else {
      setPowerBank(data);
    }
    setLoading(false);
  };

  const handleHandover = async () => {
    if (!ticketCode.trim()) {
      setMessage('Please enter a ticket code');
      setMessageType('error');
      return;
    }

    if (!powerBank) {
      setMessage('Power bank not found');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // 1. Find the rental by ticket code
      const { data: rental, error: rentalError } = await supabase
        .from('rentals')
        .select('*')
        .eq('ticket_code', ticketCode.trim())
        .eq('status', 'paid')
        .single();

      if (rentalError || !rental) {
        setMessage('Invalid or unpaid ticket code. Please check and try again.');
        setMessageType('error');
        setLoading(false);
        return;
      }

      // 2. Update power bank status to 'rented'
      const { error: pbError } = await supabase
        .from('power_banks')
        .update({ 
          status: 'rented'
        })
        .eq('id', powerBank.id);

      if (pbError) throw pbError;

      // 3. Update rental: set status to 'active', assign power bank AND location
      const { error: rentalUpdateError } = await supabase
        .from('rentals')
        .update({ 
          status: 'active',
          power_bank_id: powerBank.id,
          location_id: powerBank.location_id // Links it to the dashboard!
        })
        .eq('id', rental.id);

      if (rentalUpdateError) throw rentalUpdateError;

      setMessage(`✅ Handover successful! Power bank ${powerBank.pb_code} handed to ${rental.customer_name}`);
      setMessageType('success');
      setTicketCode('');
      
      // Refresh power bank data to show "Rented" status
      fetchPowerBank(powerBank.pb_code);
    } catch (error: any) {
      console.error('Handover error:', error);
      setMessage('Error completing handover: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!powerBank) return;
    
    setLoading(true);
    setMessage('');

    try {
      // 1. Find the active rental for this power bank
      const { data: rental, error: rentalError } = await supabase
        .from('rentals')
        .select('*')
        .eq('power_bank_id', powerBank.id)
        .eq('status', 'active')
        .single();

      if (rentalError || !rental) {
        setMessage('No active rental found for this power bank.');
        setMessageType('error');
        setLoading(false);
        return;
      }

      // 2. Update power bank status back to 'available'
      const { error: pbError } = await supabase
        .from('power_banks')
        .update({ 
          status: 'available'
        })
        .eq('id', powerBank.id);

      if (pbError) throw pbError;

      // 3. Update rental status to 'returned' and set end time
      const { error: rentalUpdateError } = await supabase
        .from('rentals')
        .update({ 
          status: 'returned',
          ended_at: new Date().toISOString()
        })
        .eq('id', rental.id);

      if (rentalUpdateError) throw rentalUpdateError;

      setMessage(`✅ Return confirmed! Power bank ${powerBank.pb_code} is now available.`);
      setMessageType('success');
      
      // Refresh power bank data
      fetchPowerBank(powerBank.pb_code);
    } catch (error: any) {
      console.error('Return error:', error);
      setMessage('Error processing return: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !powerBank) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      {powerBank && (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', color: '#0f172a' }}>{powerBank.pb_code}</h1>
          <span style={{
            display: 'inline-block',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            backgroundColor: powerBank.status === 'available' ? '#dcfce7' : '#fee2e2',
            color: powerBank.status === 'available' ? '#15803d' : '#b91c1c'
          }}>
            {powerBank.status?.toUpperCase()}
          </span>
          {powerBank.locations && (
            <p style={{ color: '#64748b', margin: '10px 0' }}>
               {powerBank.locations.name}
            </p>
          )}
        </div>
      )}

      {message && (
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: messageType === 'success' ? '#dcfce7' : '#fee2e2',
          color: messageType === 'success' ? '#15803d' : '#b91c1c',
          fontSize: '14px'
        }}>
          {messageType === 'error' && <span>❌ </span>}
          {message}
        </div>
      )}

      {/* HANDOVER SECTION (Only show if Available) */}
      {powerBank?.status === 'available' && (
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#0f172a' }}>Rent Out</h2>
          
          <input
            type="text"
            placeholder="Enter ticket code (e.g., TKT-123456)"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '15px',
              marginBottom: '15px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              textAlign: 'center',
              textTransform: 'uppercase'
            }}
          />

          <button
            onClick={handleHandover}
            disabled={loading || !ticketCode.trim()}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: loading || !ticketCode.trim() ? '#94a3b8' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading || !ticketCode.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : 'Confirm Handover'}
          </button>
        </div>
      )}

      {/* RETURN SECTION (Only show if Rented) */}
      {powerBank?.status === 'rented' && (
        <div style={{
          backgroundColor: '#fef3c7',
          padding: '25px',
          borderRadius: '12px',
          border: '1px solid #fcd34d',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 20px 0', color: '#92400e', fontSize: '16px', fontWeight: '600' }}>
             This power bank is currently rented out
          </p>
          <button
            onClick={handleReturn}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: loading ? '#94a3b8' : '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : 'Confirm Return'}
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <a
          href="/owner/dashboard"
          style={{
            color: '#2563eb',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          ← Back to Owner Dashboard
        </a>
      </div>
    </main>
  );
}

export default function PowerBankPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        Loading power bank details...
      </div>
    }>
      <PowerBankContent />
    </Suspense>
  );
}
