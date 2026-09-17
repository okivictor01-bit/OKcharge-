"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('ref');
  const ticket = searchParams.get('ticket');
  
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/verify-payment?ref=${reference}`);
        const data = await response.json();

        if (data.success) {
          setVerified(true);
        } else {
          setError(data.error || 'Verification failed');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Could not verify payment');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [reference]);

  if (verifying) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', backgroundColor: '#f0fdf4' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ color: '#0f172a' }}>Verifying your payment...</h2>
          <p style={{ color: '#64748b' }}>Please do not close this page.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', backgroundColor: '#fef2f2' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <h2 style={{ color: '#991b1b' }}>Verification Failed</h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>{error}</p>
          <p style={{ fontSize: '14px', color: '#64748b' }}>If money was deducted, please contact support with reference: {reference}</p>
          <Link href="/" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 24px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ 
      fontFamily: 'sans-serif', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#f0fdf4'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        textAlign: 'center',
        width: '100%'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
        <h1 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '10px' }}>Payment Successful!</h1>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>Your power bank rental is confirmed and the owner has been credited.</p>
        
        {/* Ticket Information */}
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '25px', 
          borderRadius: '12px', 
          marginBottom: '25px',
          border: '2px solid #10b981'
        }}>
          <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>YOUR RENTAL TICKET</p>
          
          {ticket && (
            <div style={{ 
              backgroundColor: 'white', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '15px',
              border: '2px dashed #10b981'
            }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b' }}>Ticket Code</p>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#0f172a', fontFamily: 'monospace' }}>{ticket}</p>
            </div>
          )}

          {reference && (
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#64748b' }}>
                <strong>Payment Reference:</strong><br/>
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{reference}</span>
              </p>
            </div>
          )}
        </div>

        <div style={{ 
          backgroundColor: '#fef3c7', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '25px',
          textAlign: 'left'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#92400e', fontWeight: 'bold' }}>📋 Next Steps:</p>
          <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#78350f', lineHeight: '1.8' }}>
            <li>Show this ticket code to the staff at the station</li>
            <li>Collect your fully charged power bank</li>
            <li>Return before time expires to avoid extra charges</li>
          </ol>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link 
            href="/" 
            style={{ 
              display: 'inline-block',
              padding: '14px 30px', 
              backgroundColor: '#10b981', 
              color: 'white', 
              borderRadius: '8px', 
              textDecoration: 'none', 
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Back to Home
          </Link>
          <a 
            href="https://wa.me/2347032385674" 
            target="_blank"
            style={{ 
              display: 'inline-block',
              padding: '12px 30px', 
              backgroundColor: '#25D366', 
              color: 'white', 
              borderRadius: '8px', 
              textDecoration: 'none', 
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            💬 Need Help? Chat on WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}

export default function RentSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        Loading your ticket...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
