export default function PrivacyPage() {
  return (
    <main style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>Privacy Policy</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '40px' }}>Last updated: January 2026</p>
      
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>1. Introduction</h2>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6' }}>
          OKcharge ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our power bank rental services.
        </p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>2. Information We Collect</h2>
        <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '10px' }}>Personal Information</h3>
        <ul style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '15px' }}>
          <li>Name and contact information</li>
          <li>Phone number</li>
          <li>Email address</li>
          <li>Payment information (processed securely via Paystack)</li>
        </ul>
        
        <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '10px' }}>Usage Information</h3>
        <ul style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Rental history and duration</li>
          <li>Location data (rental and return locations)</li>
          <li>Device information and browser type</li>
        </ul>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>3. How We Use Your Information</h2>
        <ul style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>To process your power bank rentals and payments</li>
          <li>To send you rental confirmations and reminders</li>
          <li>To provide customer support</li>
          <li>To improve our services and user experience</li>
          <li>To send promotional communications (with your consent)</li>
          <li>To comply with legal obligations</li>
        </ul>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>4. Payment Security</h2>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6' }}>
          All payment transactions are processed through Paystack, a PCI-DSS Level 1 certified payment processor. We do not store your credit card or bank account information on our servers.
        </p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>5. Data Sharing</h2>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', marginBottom: '15px' }}>
          We do not sell your personal information. We may share your information with:
        </p>
        <ul style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Payment processors (Paystack) to complete transactions</li>
          <li>Service providers who assist in our operations</li>
          <li>Law enforcement when required by law</li>
        </ul>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>6. Your Rights</h2>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', marginBottom: '15px' }}>
          You have the right to:
        </p>
        <ul style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Access your personal data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt-out of marketing communications</li>
        </ul>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>7. Contact Us</h2>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6' }}>
          If you have questions about this Privacy Policy, please contact us at:{' '}
          <a href="mailto:support@okcharge.ng" style={{ color: '#2563eb' }}>support@okcharge.ng</a>
        </p>
      </div>
    </main>
  );
}
