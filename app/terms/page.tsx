export default function TermsPage() {
  return (
    <main style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>Terms and Conditions</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '40px' }}>Last updated: January 2026</p>
      
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>1. Agreement to Terms</h2>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6' }}>By accessing and using OKcharge's power bank rental services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services.</p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>2. Rental Service</h2>
        
        <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '10px' }}>2.1 Rental Period</h3>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', marginBottom: '15px' }}>You agree to return the power bank within the duration you selected and paid for. Extended usage will incur additional charges.</p>
        
        <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '10px' }}>2.2 Proper Use</h3>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', marginBottom: '15px' }}>You agree to use the power bank responsibly and not for any illegal purposes. You are responsible for any damage caused by misuse.</p>
        
        <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '10px' }}>2.3 Return Policy</h3>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', marginBottom: '15px' }}>Power banks must be returned to the designated location. Failure to return the power bank within 7 days will be considered theft, and you will be charged the full replacement cost (₦15,000).</p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>3. Payment Terms</h2>
        <ul style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '15px' }}>
          <li>All payments are processed securely via Paystack</li>
          <li>Payment is required upfront before rental</li>
          <li>All fees are non-refundable unless the power bank is defective</li>
          <li>Late return fees will be charged automatically</li>
        </ul>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6' }}><strong>Pricing:</strong> 1 Hour - ₦100 | 3 Hours - ₦200 | 5 Hours - ₦300 | 24 Hours - ₦800</p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>4. User Responsibilities</h2>
        <ul style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Provide accurate contact information</li>
          <li>Maintain the security of your rental ticket code</li>
          <li>Return the power bank in the condition it was received</li>
          <li>Report any defects or issues immediately</li>
          <li>Be at least 18 years old to rent</li>
        </ul>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>5. Security & Data Collection</h2>
        
        <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '10px' }}>5.1 Information Collection</h3>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', marginBottom: '15px' }}>
          To ensure the security of our equipment and prevent theft, station owners are required to collect the following information at the time of rental:
        </p>
        <ul style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '15px' }}>
          <li><strong>Photograph:</strong> A photo of the customer taking the rental</li>
          <li><strong>Phone Number:</strong> Your active mobile phone number</li>
          <li><strong>Device IMEI:</strong> Your phone's unique identifier (IMEI number)</li>
        </ul>

        <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '10px' }}>5.2 Purpose of Data Collection</h3>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', marginBottom: '15px' }}>
          <strong>This information is collected SOLELY for the purpose of:</strong>
        </p>
        <ul style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '15px' }}>
          <li>Recovering unreturned power banks</li>
          <li>Identifying customers who fail to return rented equipment</li>
          <li>Legal proceedings in case of theft or non-return</li>
        </ul>

        <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '10px' }}>5.3 Data Protection</h3>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', marginBottom: '15px' }}>
          By renting from OKcharge, you consent to the collection of this information. We guarantee that:
        </p>
        <ul style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>This data will NOT be used for marketing purposes</li>
          <li>This data will NOT be shared with third parties except for legal/recovery purposes</li>
          <li>This data will be stored securely and only accessed when necessary</li>
          <li>This data will be deleted after the power bank is successfully returned</li>
        </ul>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>6. Limitation of Liability</h2>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', marginBottom: '15px' }}>OKcharge shall not be liable for:</p>
        <ul style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Damage to your device while charging</li>
          <li>Loss of data or information</li>
          <li>Service interruptions or unavailability</li>
          <li>Indirect, incidental, or consequential damages</li>
        </ul>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>7. Termination</h2>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6' }}>We reserve the right to terminate or suspend your access to our services for violations of these terms, fraudulent activity, or abuse of the rental system.</p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>8. Changes to Terms</h2>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6' }}>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.</p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '15px' }}>9. Governing Law</h2>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6' }}>These terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.</p>
      </div>

      <div style={{ backgroundColor: '#eff6ff', padding: '30px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
        <h2 style={{ fontSize: '24px', color: '#1e40af', marginBottom: '15px' }}>Questions?</h2>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6' }}>If you have any questions about these Terms and Conditions, please contact us at: <a href="mailto:support@okcharge.ng" style={{ color: '#2563eb' }}>support@okcharge.ng</a></p>
      </div>
    </main>
  );
}
