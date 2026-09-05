"use client";

import { useState } from 'react';

export default function TestApiPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [formData, setFormData] = useState({
    business_name: 'Test Business',
    bank_code: '044',
    account_number: '0123456789',
    percentage: 30
  });

  const handleTest = async () => {
    setLoading(true);
    setResult('⏳ Sending request to Supabase Edge Function...\n');
    
    try {
      const supabaseUrl = 'https://zsjmudkesxrlrhtugdon.supabase.co';
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/create-paystack-subaccount`;
      
      setResult(`📡 Sending to: ${edgeFunctionUrl}\n`);
      setResult(prev => prev + `📦 Data: ${JSON.stringify(formData, null, 2)}\n\n`);

      const res = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpzam11ZGtlc3hybHJodHVnZG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1MzA4MzEsImV4cCI6MjA0MTEwNjgzMX0.J8vKZxZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z` 
        },
        body: JSON.stringify(formData)
      });
      
      setResult(prev => prev + `📥 Response Status: ${res.status}\n`);
      setResult(prev => prev + `📋 Response Headers: ${JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2)}\n\n`);
      
      const text = await res.text();
      setResult(prev => prev + `📄 Raw Response:\n${text}\n\n`);
      
      // Try to parse as JSON if possible
      try {
        const jsonData = JSON.parse(text);
        setResult(prev => prev + `✅ Parsed JSON:\n${JSON.stringify(jsonData, null, 2)}`);
      } catch {
        setResult(prev => prev + `❌ Response is not valid JSON`);
      }
      
    } catch (err: any) {
      setResult(prev => prev + `🚨 Network Error: ${err.message}\nStack: ${err.stack}`);
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
        overflowX: 'auto', fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all'
      }}>
        {result || 'No response yet. Click the button above.'}
      </pre>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin/dashboard" style={{ color: '#2563eb' }}>← Back to Dashboard</a>
      </div>
    </main>
  );
}
