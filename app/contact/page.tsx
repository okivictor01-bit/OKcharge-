"use client";

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSent(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '15px',
    marginBottom: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    fontFamily: 'sans-serif'
  };

  return (
    <main style={{ padding: '40px 20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f172a', marginBottom: '15px' }}>Contact Us</h1>
        <p style={{ fontSize: '18px', color: '#64748b' }}>Have questions or feedback? We'd love to hear from you.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        {/* Contact Info */}
        <div>
          <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '20px' }}>Get in Touch</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '5px' }}>📍 Our Address</h3>
            <p style={{ fontSize: '16px', color: '#475569', margin: 0 }}>Akure, Ondo State, Nigeria</p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '5px' }}>📞 Phone Number</h3>
            <p style={{ fontSize: '16px', color: '#475569', margin: 0 }}>+234 703 238 5674</p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '5px' }}>✉️ Email Address</h3>
            <p style={{ fontSize: '16px', color: '#475569', margin: 0 }}>support@okcharge.ng</p>
          </div>

          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h3 style={{ fontSize: '16px', color: '#1e40af', marginBottom: '10px', marginTop: 0 }}>Business Hours</h3>
            <p style={{ fontSize: '14px', color: '#475569', margin: '5px 0' }}>Monday - Friday: 8:00 AM - 6:00 PM</p>
            <p style={{ fontSize: '14px', color: '#475569', margin: '5px 0' }}>Saturday: 9:00 AM - 4:00 PM</p>
            <p style={{ fontSize: '14px', color: '#475569', margin: '5px 0' }}>Sunday: Closed</p>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '20px', marginTop: 0 }}>Send us a Message</h2>
          
          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>✅</div>
              <h3 style={{ color: '#10b981', marginBottom: '10px' }}>Message Sent!</h3>
              <p style={{ color: '#64748b' }}>Thank you for reaching out. We will get back to you shortly.</p>
              <button onClick={() => setSent(false)} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#334155' }}>Your Name</label>
              <input 
                style={inputStyle} 
                type="text" 
                placeholder="John Doe" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />

              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#334155' }}>Email Address</label>
              <input 
                style={inputStyle} 
                type="email" 
                placeholder="you@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
              />

              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#334155' }}>Message</label>
              <textarea 
                style={{...inputStyle, minHeight: '120px', resize: 'vertical'}} 
                placeholder="How can we help you?" 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required 
              />

              <button 
                type="submit" 
                style={{ 
                  width: '100%', 
                  padding: '15px', 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer' 
                }}
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
