import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ 
      backgroundColor: '#f8fafc', 
      padding: '40px 20px 20px', 
      borderTop: '1px solid #e2e8f0',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '30px', 
          marginBottom: '30px' 
        }}>
          {/* Brand */}
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb', margin: '0 0 15px 0' }}>⚡ OKcharge</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Never run out of battery again. Rent power banks instantly across the city.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#0f172a' }}>Quick Links</h4>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ marginBottom: '8px' }}><Link href="/about" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>About Us</Link></li>
              <li style={{ marginBottom: '8px' }}><Link href="/contact" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>Contact</Link></li>
              <li style={{ marginBottom: '8px' }}><Link href="/faq" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#0f172a' }}>Legal</h4>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ marginBottom: '8px' }}><Link href="/privacy" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</Link></li>
              <li style={{ marginBottom: '8px' }}><Link href="/terms" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#0f172a' }}>Contact Us</h4>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>📍 Lagos, Nigeria</p>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>📱 +234 703 238 5674</p>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>✉️ support@okcharge.ng</p>
          </div>
        </div>

        <div style={{ 
          borderTop: '1px solid #e2e8f0', 
          paddingTop: '20px', 
          textAlign: 'center',
          fontSize: '14px',
          color: '#94a3b8'
        }}>
          <p style={{ margin: 0 }}>© 2026 OKcharge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
