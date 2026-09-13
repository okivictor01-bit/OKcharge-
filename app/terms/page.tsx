export default function TermsPage() {
  return (
    <main style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', lineHeight: '1.6', color: '#334155' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>Terms and Conditions</h1>
      <p style={{ marginBottom: '30px', color: '#64748b' }}>Last updated: September 13, 2026</p>

      <p style={{ marginBottom: '20px' }}>
        Welcome to OKcharge. By using our power bank rental services, website, or mobile platform, you agree to be bound by the following Terms and Conditions. Please read them carefully.
      </p>

      <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginTop: '30px', marginBottom: '15px' }}>1. Acceptance of Terms</h2>
      <p style={{ marginBottom: '20px' }}>
        By accessing or using OKcharge, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree, please do not use our services.
      </p>

      <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginTop: '30px', marginBottom: '15px' }}>2. Rental Services & Usage</h2>
      
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginTop: '20px', marginBottom: '10px' }}>2.1 Eligibility</h3>
      <p style={{ marginBottom: '20px' }}>
        You must be at least 18 years old and possess a valid means of identification and payment to rent a power bank from OKcharge.
      </p>

      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginTop: '20px', marginBottom: '10px' }}>2.2 Security & Data Collection</h3>
      <p style={{ marginBottom: '20px' }}>
        To ensure the security of our equipment and prevent theft, our location partners and staff are authorized to collect specific information at the time of rental. By renting a power bank, you consent to the collection of:
      </p>
      <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
        <li style={{ marginBottom: '10px' }}><strong>A Photograph:</strong> A clear picture of the customer taking the rental.</li>
        <li style={{ marginBottom: '10px' }}><strong>Phone Number:</strong> A valid, active mobile number for rental tracking and communication.</li>
        <li style={{ marginBottom: '10px' }}><strong>IMEI Number:</strong> The International Mobile Equipment Identity (IMEI) number of the mobile phone being used to facilitate the rental or receive communications.</li>
      </ul>
      <p style={{ marginBottom: '20px', fontSize: '14px', color: '#64748b' }}>
        <em>This data is collected strictly for security, rental tracking, and recovery purposes in accordance with our Privacy Policy.</em>
      </p>

      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginTop: '20px', marginBottom: '10px' }}>2.3 Return Policy</h3>
      <div style={{ 
        backgroundColor: '#fef2f2', 
        padding: '15px 20px', 
        borderRadius: '8px', 
        borderLeft: '4px solid #ef4444', 
        marginBottom: '20px',
        color: '#991b1b'
      }}>
        <strong>Important:</strong> Power banks must be returned to the designated location. Failure to return the power bank within 7 days will be considered theft, and you will be charged the full replacement cost (₦15,000), the total cost of tracking, and applicable police charges.
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginTop: '30px', marginBottom: '15px' }}>3. Payments & Fees</h2>
      <p style={{ marginBottom: '20px' }}>
        All rental fees are charged upfront via our secure payment gateway (Paystack). If you exceed your rental time, additional charges will apply based on our standard hourly rates. Any penalties for late return or loss will be charged to the payment method on file.
      </p>

      <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginTop: '30px', marginBottom: '15px' }}>4. User Responsibilities</h2>
      <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
        <li style={{ marginBottom: '10px' }}>You are fully responsible for the power bank from the time it is rented until it is successfully returned and confirmed by our staff.</li>
        <li style={{ marginBottom: '10px' }}>Do not attempt to open, modify, or damage the power bank or its cables. You will be held liable for any damages.</li>
        <li style={{ marginBottom: '10px' }}>Report any issues, malfunctions, or lost items to our staff or customer support immediately.</li>
      </ul>

      <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginTop: '30px', marginBottom: '15px' }}>5. Limitation of Liability</h2>
      <p style={{ marginBottom: '20px' }}>
        OKcharge is not responsible for any damage to your personal electronic devices caused by using our power banks. We provide the equipment in good working condition, but we do not guarantee compatibility with all devices.
      </p>

      <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginTop: '30px', marginBottom: '15px' }}>6. Governing Law</h2>
      <p style={{ marginBottom: '20px' }}>
        These Terms and Conditions are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from these terms will be resolved in the courts of Nigeria.
      </p>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
          If you have any questions about these Terms, please contact us at <a href="mailto:support@okcharge.ng" style={{ color: '#2563eb', textDecoration: 'none' }}>support@okcharge.ng</a> or via WhatsApp at +234 703 238 5674.
        </p>
      </div>
    </main>
  );
}
