import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OKcharge - Rent a Power Bank Instantly",
  description: "Never run out of battery again. Rent a power bank from OKcharge locations across the city.",
};

export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', color: '#0f172a', backgroundColor: '#ffffff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>⚡ OKcharge</div>
        <div><a href="/auth/login" style={{ textDecoration: 'none', color: '#475569', fontSize: '14px', fontWeight: 'bold' }}>Partner Login</a></div>
      </header>

      <section style={{ textAlign: 'center', padding: '60px 20px 40px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '800', margin: '0 0 20px 0', lineHeight: '1.1', color: '#0f172a' }}>Power On The Go. <br /><span style={{ color: '#2563eb' }}>Never Run Out.</span></h1>
        <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>Rent a high-capacity power bank in seconds from any OKcharge station. Pay securely, charge your phone, and return it anywhere.</p>
        <a href="/rent" style={{ display: 'inline-block', backgroundColor: '#10b981', color: 'white', padding: '18px 40px', borderRadius: '50px', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}> Rent a Power Bank Now</a>
      </section>

      <section style={{ backgroundColor: '#f8fafc', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '28px', marginBottom: '40px' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            <div style={{ textAlign: 'center', padding: '20px' }}><div style={{ fontSize: '40px', marginBottom: '15px' }}>📍</div><h3 style={{ fontSize: '18px', marginBottom: '10px' }}>1. Find a Station</h3><p style={{ color: '#64748b', fontSize: '14px' }}>Locate the nearest OKcharge power bank station at your favorite store or cafe.</p></div>
            <div style={{ textAlign: 'center', padding: '20px' }}><div style={{ fontSize: '40px', marginBottom: '15px' }}>💳</div><h3 style={{ fontSize: '18px', marginBottom: '10px' }}>2. Pay Securely</h3><p style={{ color: '#64748b', fontSize: '14px' }}>Enter your details and pay instantly via Paystack. Get your unique rental ticket.</p></div>
            <div style={{ textAlign: 'center', padding: '20px' }}><div style={{ fontSize: '40px', marginBottom: '15px' }}>🔌</div><h3 style={{ fontSize: '18px', marginBottom: '10px' }}>3. Unlock & Charge</h3><p style={{ color: '#64748b', fontSize: '14px' }}>Show your ticket to the staff, grab a fully charged power bank, and enjoy!</p></div>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', marginBottom: '10px' }}>Simple, Transparent Pricing</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '40px' }}>Choose the duration that fits your needs.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
          {[
            { time: '1 Hour', price: '₦100' },
            { time: '3 Hours', price: '₦200' },
            { time: '5 Hours', price: '₦300' },
            { time: '24 Hours', price: '₦800' },
          ].map((plan, idx) => (
            <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center', backgroundColor: idx === 1 ? '#eff6ff' : 'white', borderColor: idx === 1 ? '#3b82f6' : '#e2e8f0' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>{plan.time}</p>
              <h3 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{plan.price}</h3>
            </div>
          ))}
        </div>
      </section>

      <section style={{ backgroundColor: '#0f172a', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '15px' }}>Own a Business Location?</h2>
          <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '16px' }}>Partner with OKcharge and earn up to <strong>75% revenue share</strong> on every rental made at your location. We handle the hardware and maintenance.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px', textAlign: 'left' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#10b981' }}>Standard Partnership</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#d1d5db' }}>We provide the power banks<br/>You earn <strong>40%</strong></p>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#10b981' }}>Owner Partnership</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#d1d5db' }}>You provide your own power banks<br/>You earn <strong>75%</strong></p>
            </div>
          </div>
          <a href="/auth/register" style={{ display: 'inline-block', backgroundColor: 'white', color: '#0f172a', padding: '15px 30px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Become a Partner</a>
        </div>
      </section>

      <footer style={{ padding: '30px 20px', textAlign: 'center', color: '#64748b', fontSize: '14px', borderTop: '1px solid #e2e8f0' }}>
        <p style={{ margin: '0 0 10px 0' }}>© 2026 OKcharge. All rights reserved.</p>
        <p style={{ margin: 0 }}>Need help? Chat with us on WhatsApp via the button below.</p>
      </footer>
    </main>
  );
}
