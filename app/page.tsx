import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OKcharge - Rent a Power Bank Instantly",
  description: "Never run out of battery again. Rent a power bank from OKcharge locations across the city.",
};

export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', color: '#0f172a', backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative',
        textAlign: 'center', 
        padding: '100px 20px 80px', 
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundImage: 'url(/hero-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        {/* Dark Overlay for readability */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          zIndex: 1
        }}></div>
        
        {/* Header inside Hero */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto 60px auto', width: '100%' }}>
          <img src="/logo.png" alt="OKcharge" style={{ height: '50px', width: 'auto' }} />
          <a href="/auth/login" style={{ textDecoration: 'none', color: 'white', fontSize: '14px', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '20px' }}>Partner Login</a>
        </div>

        {/* Hero Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: '800', margin: '0 0 20px 0', lineHeight: '1.1', color: 'white' }}>
            Stay Charged, <br /><span style={{ color: '#10b981' }}>Always</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#e5e7eb', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
            Rent a power bank. Keep going. Fast, easy and reliable.
          </p>
          <a href="/rent" style={{ display: 'inline-block', backgroundColor: '#10b981', color: 'white', padding: '18px 40px', borderRadius: '50px', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}> Rent a Power Bank Now</a>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ backgroundColor: '#f8fafc', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '28px', marginBottom: '40px' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            <div style={{ textAlign: 'center', padding: '20px' }}><div style={{ fontSize: '40px', marginBottom: '15px' }}></div><h3 style={{ fontSize: '18px', marginBottom: '10px' }}>1. Find a Station</h3><p style={{ color: '#64748b', fontSize: '14px' }}>Locate the nearest OKcharge power bank station at your favorite store or cafe.</p></div>
            <div style={{ textAlign: 'center', padding: '20px' }}><div style={{ fontSize: '40px', marginBottom: '15px' }}>💳</div><h3 style={{ fontSize: '18px', marginBottom: '10px' }}>2. Pay Securely</h3><p style={{ color: '#64748b', fontSize: '14px' }}>Enter your details and pay instantly via Paystack. Get your unique rental ticket.</p></div>
            <div style={{ textAlign: 'center', padding: '20px' }}><div style={{ fontSize: '40px', marginBottom: '15px' }}>🔌</div><h3 style={{ fontSize: '18px', marginBottom: '10px' }}>3. Unlock & Charge</h3><p style={{ color: '#64748b', fontSize: '14px' }}>Show your ticket to the staff, grab a fully charged power bank, and enjoy!</p></div>
          </div>
        </div>
      </section>

      {/* Pricing */}
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

      {/* Partner Section */}
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
    </main>
  );
}
