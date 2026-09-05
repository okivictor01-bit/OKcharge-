import Link from 'next/link';

export default function AboutPage() {
  return (
    <main style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>About OKcharge</h1>
      
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', color: '#2563eb', marginBottom: '15px' }}>Our Mission</h2>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', marginBottom: '15px' }}>
          At OKcharge, we believe nobody should have to worry about their phone battery dying. Whether you're at a party, in a meeting, or exploring the city, we've got you covered.
        </p>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6' }}>
          Our mission is to provide convenient, affordable, and reliable power bank rental services across Nigeria. We're making sure you're always connected, always charged, and always ready.
        </p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', color: '#2563eb', marginBottom: '15px' }}>How We Started</h2>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', marginBottom: '15px' }}>
          OKcharge was born from a simple frustration: we were tired of carrying heavy power banks everywhere or searching desperately for charging points.
        </p>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6' }}>
          We envisioned a world where power is as easy to access as hailing a ride. Today, we partner with locations across the city to bring you instant power whenever you need it.
        </p>
      </div>

      <div style={{ backgroundColor: '#eff6ff', padding: '30px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
        <h2 style={{ fontSize: '24px', color: '#1e40af', marginBottom: '15px' }}>Why Choose OKcharge?</h2>
        <ul style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>✅ Instant rental - no long queues</li>
          <li>✅ Affordable pricing from ₦100</li>
          <li>✅ Secure Paystack payments</li>
          <li>✅ High-capacity, fast-charging power banks</li>
          <li>✅ Multiple locations across the city</li>
          <li>✅ 24/7 customer support</li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link href="/rent" style={{ 
          display: 'inline-block',
          backgroundColor: '#10b981', 
          color: 'white', 
          padding: '15px 30px', 
          borderRadius: '8px', 
          textDecoration: 'none', 
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          Rent a Power Bank Now
        </Link>
      </div>
    </main>
  );
}
