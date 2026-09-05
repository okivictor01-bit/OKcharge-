"use client";

import { useState } from 'react';

export default function TestApiPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [formData, setFormData] = useState({
    business_name: 'Test Business',
    bank_code: '044', // Access Bank code
    account_number: '0123456789', // Dummy account
    percentage: 30
  });

  const handleTest = async () => {
    setLoading(true);
    setResult('⏳ Sending request to Supabase Edge Function...');
    
    try {
      // Your exact Supabase Project URL
      const supabaseUrl = 'https://zsjmudkesxrlrhtugdon.supabase.co'; 
      
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/create-paystack-subaccount`;

      const res = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` 
        },
        body: JSON.stringify(formData)
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setResult(`✅ Status: ${res.status}\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        const text = await res.text();
        setResult(` Status: ${res.status}\nExpected JSON, but got:\n\n${text.substring(0, 500)}...`);
      }
    } catch (err: any) {
      setResult(` Network Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Test Subaccount API</h1>
      
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold' }}>Business Name</label>
        <input 
          value={formData.business_name} 
          onChange={(e) => setFormData({...formData, business_name: e.target.value})}
          style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }}
        />

        <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold' }}>Bank Code (e.g., 044 for Access)</label>
        <input 
          value={formData.bank_code} 
          onChange={(e) => setFormData({...formData, bank_code: e.target.value})}
          style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }}
        />

        <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold' }}>Account Number</label>
        <input 
          value={formData.account_number} 
          onChange={(e) => setFormData({...formData, account_number: e.target.value})}
          style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }}
        />

        <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold' }}>Percentage (%)</label>
        <input 
          type="number"
          value={formData.percentage} 
          onChange={(e) => setFormData({...formData, percentage: parseInt(e.target.value)})}
          style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }}
        />

        <button 
          onClick={handleTest} 
          disabled={loading}
          style={{ 
            width: '100%', padding: '15px', backgroundColor: loading ? '#999' : '#2563eb', 
            color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' 
          }}
        >
          {loading ? 'Testing...' : 'Run API Test'}
        </button>
      </div>

      <h3>API Response:</h3>
      <pre style={{ 
        backgroundColor: '#1e293b', color: '#10b981', padding: '15px', borderRadius: '8px', 
        overflowX: 'auto', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all'
      }}>
        {result || 'No response yet. Click the button above.'}
      </pre>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin/dashboard" style={{ color: '#2563eb' }}>← Back to Dashboard</a>
      </div>
    </main>
  );
}
