"use client";

import { useState } from 'react';

export default function StaffDashboard() {
  const [scanCode, setScanCode] = useState('');

  const handleGoToPB = () => {
    if (scanCode) {
      window.location.href = `/staff/pb?code=${scanCode}`;
    }
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Staff Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Manage power bank rentals</p>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0 }}>Manual Entry</h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>Enter a Power Bank code manually</p>
        <input
          type="text"
          placeholder="e.g., OKJD02"
          value={scanCode}
          onChange={(e) => setScanCode(e.target.value.toUpperCase())}
          style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', textAlign: 'center', boxSizing: 'border-box' }}
        />
        <button
          onClick={handleGoToPB}
          style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Go to Power Bank
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', textAlign: 'left' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>How to use:</h3>
        <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#856404' }}>
          <li>Scan the QR code on a power bank to open its management page.</li>
          <li>Or enter the code manually above.</li>
          <li>Use the buttons to Rent Out, Confirm Return, or report issues.</li>
        </ol>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Home</a>
      </div>
    </main>
  );
}
