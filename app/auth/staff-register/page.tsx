"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function StaffRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', secret: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // SECURITY CHECK: Only allow registration if the secret code is correct
    if (formData.secret !== 'OKCHARGE_ADMIN_2026') {
      setMessage('❌ Invalid Secret Code.');
      return;
    }

    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          role: 'staff' // This tells the database to make them a staff member
        }
      }
    });

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('✅ Staff member created successfully! They can now login.');
      setFormData({ name: '', email: '', password: '', secret: '' });
    }
    setLoading(false);
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '50px auto' }}>
      <h1 style={{ textAlign: 'center' }}>Create Staff Account</h1>
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b' }}>Admin Only</p>
      
      <form onSubmit={handleRegister} style={{ display: 'grid', gap: '15px' }}>
        <input 
          placeholder="Full Name" 
          required 
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})} 
          style={inputStyle} 
        />
        <input 
          type="email" 
          placeholder="Email Address" 
          required 
          value={formData.email} 
          onChange={e => setFormData({...formData, email: e.target.value})} 
          style={inputStyle} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          required 
          value={formData.password} 
          onChange={e => setFormData({...formData, password: e.target.value})} 
          style={inputStyle} 
        />
        <input 
          type="password" 
          placeholder="Admin Secret Code" 
          required 
          value={formData.secret} 
          onChange={e => setFormData({...formData, secret: e.target.value})} 
          style={inputStyle} 
        />
        
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Creating...' : 'Create Staff Account'}
        </button>
      </form>

      {message && (
        <p style={{ textAlign: 'center', marginTop: '20px', color: message.includes('✅') ? 'green' : 'red' }}>
          {message}
        </p>
      )}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <a href="/auth/login" style={{ color: '#2563eb' }}>Back to Login</a>
      </div>
    </main>
  );
}

const inputStyle = { padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };
const btnStyle = { padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
