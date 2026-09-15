"use client";

import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Navigation Bar */}
      <nav style={{ 
        backgroundColor: 'white', 
        padding: '15px 20px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="OKcharge" style={{ height: '40px', width: 'auto' }} />
          </Link>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link 
              href="/auth/login" 
              style={{ 
                padding: '10px 18px', 
                backgroundColor: 'transparent', 
                color: '#0f172a', 
                borderRadius: '8px', 
                textDecoration: 'none', 
                fontWeight: '600',
                border: '1px solid #e2e8f0',
                fontSize: '14px'
              }}
            >
              Partner Login
            </Link>
            <Link 
              href="/rent" 
              style={{ 
                padding: '10px 18px', 
                backgroundColor: '#10b981', 
                color: 'white', 
                borderRadius: '8px', 
                textDecoration: 'none', 
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Rent Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ 
        position: 'relative',
        padding: '80px 20px 100px', 
        textAlign: 'center',
        borderBottomLeftRadius: '40px',
        borderBottomRightRadius: '40px',
        overflow: 'hidden',
        backgroundColor: '#0f172a'
      }}>
        <img 
          src="/hero-bg.jpg" 
          alt="Hero Background" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0
          }}
        />
        
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.85) 100%)',
          zIndex: 1
        }} />

        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 2, color: 'white' }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '800', margin: '0 0 15px 0', lineHeight: '1.2', letterSpacing: '-1px' }}>
            Never Run Out of <span style={{ color: '#34d399' }}>Battery</span> Again.
          </h1>
          
          <p style={{ fontSize: '18px', color: '#cbd5e1', margin: '0 0 35px 0', lineHeight: '1.6', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
            Rent a fully charged power bank instantly. No app download required. Just scan, pay, and go.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
            <Link 
              href="/rent" 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '18px 40px', 
                backgroundColor: '#10b981', 
                color: 'white', 
                borderRadius: '14px', 
                textDecoration: 'none', 
                fontSize: '18px', 
                fontWeight: '700',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.4)';
              }}
            >
               ⚡ Rent a Power Bank Now
            </Link>
            
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '10px 0 0 0' }}>
              Starting at just <strong style={{ color: '#34d399' }}>₦100 / hour</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div style={{ maxWidth: '800px', margin: '-40px auto 40px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          padding: '25px', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔒</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 5px 0' }}>Paystack Secured</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>100% safe & encrypted payments</p>
          </div>
          <div>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📱</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 5px 0' }}>No App Needed</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Works directly in your browser</p>
          </div>
          <div>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚡</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 5px 0' }}>Instant Unlock</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Get your power bank in seconds</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '40px' }}>How It Works</h2>
        
        <div style={{ display: 'grid', gap: '25px' }}>
          {[
            { step: '1', icon: '📷', title: 'Scan the QR Code', desc: 'Find an OKcharge station and scan the location QR code with your phone camera.' },
            { step: '2', icon: '💳', title: 'Pay Securely', desc: 'Choose your rental duration and pay safely via Paystack. No hidden fees.' },
            { step: '3', icon: '🔋', title: 'Collect & Go', desc: 'Show your rental ticket to the staff, collect your fully charged power bank, and go!' },
            { step: '4', icon: '🔄', title: 'Return Easily', desc: 'Bring it back to any OKcharge partner location before your time runs out.' }
          ].map((item, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              gap: '20px', 
              backgroundColor: 'white', 
              padding: '25px', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0',
              alignItems: 'flex-start'
            }}>
              <div style={{ 
                backgroundColor: '#ecfdf5', 
                color: '#10b981', 
                width: '50px', 
                height: '50px', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
                  <span style={{ color: '#10b981', marginRight: '8px' }}>Step {item.step}:</span> 
                  {item.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Become Our Partner Section - UPDATED FOR 50/50 */}
      <div style={{ backgroundColor: '#f0fdf4', padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '15px' }}>Become Our Partner</h2>
        <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '10px', maxWidth: '600px', margin: '0 auto 10px' }}>
          Own a restaurant, café, or high-traffic location? Partner with OKcharge and earn passive income.
        </p>
        <p style={{ fontSize: '18px', color: '#10b981', fontWeight: 'bold', marginBottom: '30px' }}>
          We provide all power banks. You keep 50% of all revenue generated at your location.
        </p>
        <Link 
          href="/auth/register" 
          style={{ 
            display: 'inline-block',
            padding: '14px 30px', 
            backgroundColor: '#10b981', 
            color: 'white', 
            borderRadius: '10px', 
            textDecoration: 'none', 
            fontWeight: '700',
            fontSize: '16px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          Register as Partner
        </Link>
      </div>

      {/* Footer CTA */}
      <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '50px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 20px 0' }}>Ready to stay charged?</h2>
        <Link 
          href="/rent" 
          style={{ 
            display: 'inline-block',
            padding: '14px 30px', 
            backgroundColor: '#10b981', 
            color: 'white', 
            borderRadius: '10px', 
            textDecoration: 'none', 
            fontWeight: '700',
            fontSize: '16px',
            marginBottom: '30px'
          }}
        >
          Start Your Rental
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
          <Link href="/auth/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Partner Login</Link>
        </div>

        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          © {new Date().getFullYear()} OKcharge. All rights reserved.
        </p>
      </div>
    </main>
  );
}
