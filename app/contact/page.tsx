export default function ContactPage() {
  return (
    <main style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>Contact Us</h1>
      <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '40px' }}>We're here to help! Reach out to us in any way that works for you.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>💬</div>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '10px' }}>WhatsApp</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>Fastest response time</p>
          <a href="https://wa.me/2347032385674" target="_blank" rel="noopener noreferrer" style={{ 
            color: '#25D366', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            +234 703 238 5674 →
          </a>
        </div>

        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>✉️</div>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '10px' }}>Email</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>We reply within 24 hours</p>
          <a href="mailto:support@okcharge.ng" style={{ 
            color: '#2563eb', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            support@okcharge.ng →
          </a>
        </div>

        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>📍</div>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '10px' }}>Location</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>Visit our headquarters</p>
          <p style={{ fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>
            Lagos, Nigeria
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: '#eff6ff', padding: '30px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
        <h2 style={{ fontSize: '24px', color: '#1e40af', marginBottom: '15px' }}>Business Hours</h2>
        <ul style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
          <li>Monday - Friday: 8:00 AM - 6:00 PM</li>
          <li>Saturday: 10:00 AM - 4:00 PM</li>
          <li>Sunday: Closed (But WhatsApp is always open!)</li>
        </ul>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '30px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '20px' }}>Send Us a Message</h2>
        <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '20px' }}>
          Prefer to chat directly? Click the WhatsApp button in the bottom right corner for instant support!
        </p>
        <a href="https://wa.me/2347032385674" target="_blank" rel="noopener noreferrer" style={{ 
          display: 'inline-block',
          backgroundColor: '#25D366', 
          color: 'white', 
          padding: '15px 30px', 
          borderRadius: '8px', 
          textDecoration: 'none', 
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          💬 Chat on WhatsApp
        </a>
      </div>
    </main>
  );
}
