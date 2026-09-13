export default function TermsPage() {
  return (
    <main style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif', lineHeight: '1.8', color: '#334155' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>OKcharge Terms & Conditions</h1>
      <p style={{ marginBottom: '30px', color: '#64748b', fontSize: '16px' }}>Last Updated: September 13, 2026</p>

      <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #2563eb', marginBottom: '30px' }}>
        <p style={{ margin: 0, fontSize: '15px' }}>
          Welcome to OKcharge ("OKcharge", "we", "us", or "our"). OKcharge provides power bank rental services through its website, platform, and participating partner locations.
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '15px' }}>
          These Terms & Conditions ("Terms") govern your access to and use of OKcharge's power bank rental services. By renting, using, or attempting to rent an OKcharge power bank, you confirm that you have read, understood, and agree to these Terms.
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '15px', fontWeight: 'bold' }}>
          If you do not agree to these Terms, please do not use the OKcharge service.
        </p>
      </div>

      <Section title="1. Eligibility">
        <p>1.1. You must be at least 18 years old to rent an OKcharge power bank.</p>
        <p>1.2. You must provide accurate and complete information required to process and manage your rental.</p>
        <p>1.3. You must have a valid payment method accepted by OKcharge.</p>
        <p>1.4. OKcharge may refuse, suspend, or terminate a rental where we reasonably believe there has been fraud, attempted fraud, misuse of the service, non-payment, repeated failure to return equipment, or other conduct that may put OKcharge, its partners, customers, or equipment at risk.</p>
      </Section>

      <Section title="2. The OKcharge Rental Service">
        <p>2.1. OKcharge provides portable power banks to customers for temporary use in accordance with the rental period selected at the time of payment.</p>
        <p>2.2. Power banks may be made available through OKcharge-operated systems and participating OKcharge partner locations.</p>
        <p>2.3. Availability of power banks may vary by location and time. OKcharge does not guarantee that a power bank will always be available at a particular location.</p>
        <p>2.4. Customers are responsible for the power bank from the time it is issued to them until the return has been successfully completed and recorded by the OKcharge system or an authorized OKcharge partner.</p>
      </Section>

      <Section title="3. How a Rental Works">
        <p>The standard rental process is:</p>
        <ol style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li>Scan QR code</li>
          <li>Pay securely</li>
          <li>Collect your fully charged power bank</li>
          <li>Return power bank</li>
        </ol>
        <p>3.1. A rental begins when the power bank has been successfully issued to the customer following completion of the required rental and payment process.</p>
        <p>3.2. A rental ends when the power bank is successfully returned and the return is recorded or confirmed by OKcharge or an authorized OKcharge partner.</p>
        <p>3.3. Customers should follow the return instructions provided by OKcharge.</p>
      </Section>

      <Section title="4. Rental Prices">
        <p>The standard OKcharge rental prices are:</p>
        <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', margin: '15px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '10px', color: '#0f172a' }}>Rental Period</th>
                <th style={{ textAlign: 'left', padding: '10px', color: '#0f172a' }}>Rental Fee</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '10px' }}>1 Hour</td><td style={{ padding: '10px' }}>₦100</td></tr>
              <tr><td style={{ padding: '10px' }}>3 Hours</td><td style={{ padding: '10px' }}>200</td></tr>
              <tr><td style={{ padding: '10px' }}>5 Hours</td><td style={{ padding: '10px' }}>₦300</td></tr>
              <tr><td style={{ padding: '10px' }}>24 Hours</td><td style={{ padding: '10px' }}>₦800</td></tr>
            </tbody>
          </table>
        </div>
        <p>4.1. The applicable price will be displayed to the customer before the rental payment is completed.</p>
        <p>4.2. OKcharge may change its rental prices from time to time. Any price change will not retroactively change the price of a rental that has already been completed.</p>
      </Section>

      <Section title="5. Late Rentals and Additional Charges">
        <p>5.1. If you keep an OKcharge power bank beyond the rental period you paid for, an additional charge of:</p>
        <div style={{ backgroundColor: '#fef3c7', padding: '15px', borderRadius: '8px', margin: '15px 0', borderLeft: '4px solid #f59e0b' }}>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>₦100 per additional hour</p>
        </div>
        <p>5.2. Additional charges will continue to accrue at ₦100 per hour until the power bank is successfully returned, subject to a maximum additional late-rental charge of <strong>₦2,000 per rental</strong>.</p>
        <p>5.3. The ₦2,000 cap applies specifically to additional late-rental charges and does not limit other amounts that may become payable under these Terms, including applicable replacement or damage charges.</p>
        <p>5.4. Where technically and legally permitted, applicable additional charges may be charged using the payment method associated with the rental.</p>
        <p>5.5. OKcharge will not charge more than the applicable late-rental maximum stated in these Terms for late rental charges.</p>
      </Section>

      <Section title="6. Returning an OKcharge Power Bank">
        <p>6.1. You must return the power bank in accordance with the return instructions provided by OKcharge.</p>
        <p>6.2. You remain responsible for the power bank until its return has been successfully recorded or confirmed.</p>
        <p>6.3. You must not leave an OKcharge power bank unattended or hand it to an unauthorized person for return.</p>
        <p>6.4. If you experience difficulty returning a power bank, you should contact OKcharge as soon as reasonably possible.</p>
        <p>6.5. If a power bank cannot be returned because of a technical problem, unavailable return point, or other circumstance outside your reasonable control, you should notify OKcharge promptly so that the situation can be investigated.</p>
      </Section>

      <Section title="7. Lost, Unreturned or Damaged Power Banks">
        <p>7.1. Customers are responsible for reasonable care of an OKcharge power bank while it is in their possession.</p>
        <p>7.2. You must not:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>open or dismantle the power bank;</li>
          <li>modify or attempt to repair it;</li>
          <li>intentionally damage it;</li>
          <li>remove or tamper with its identification markings;</li>
          <li>interfere with its tracking or rental technology;</li>
          <li>use it for an unlawful purpose; or</li>
          <li>intentionally prevent OKcharge from recovering it.</li>
        </ul>
        <p>7.3. If a power bank is lost, destroyed, or remains unreturned because of the customer's actions or failure to return it, OKcharge may charge a replacement fee of <strong>₦15,000</strong>.</p>
        <p>7.4. The ₦15,000 replacement fee represents the replacement cost and reasonable associated operational costs of replacing the equipment.</p>
        <p>7.5. If a power bank is returned damaged beyond ordinary wear and tear, OKcharge may charge the reasonable cost of repair or replacement, depending on the circumstances and extent of the damage.</p>
        <p>7.6. Any charge under this section will be subject to applicable consumer-protection laws.</p>
      </Section>

      <Section title="8. Extended Non-Return">
        <p>8.1. If a power bank remains unreturned after the rental period, the applicable late-rental charges described in Section 5 will apply, subject to the ₦2,000 maximum.</p>
        <p>8.2. If the power bank remains unreturned and is reasonably considered lost or unrecoverable, OKcharge may treat the equipment as lost and apply the ₦15,000 replacement fee.</p>
        <p>8.3. OKcharge may contact the customer regarding an outstanding power bank and may take reasonable and lawful steps to recover its equipment.</p>
        <p>8.4. Failure to return an OKcharge power bank does not automatically constitute a criminal offence merely because the contractual return period has expired. OKcharge reserves the right to pursue any lawful remedies available to it where appropriate.</p>
      </Section>

      <Section title="9. Customer Responsibilities">
        <p>You agree to:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>9.1. Provide accurate information during the rental process.</li>
          <li>9.2. Take reasonable care of the power bank.</li>
          <li>9.3. Use the power bank only for its intended purpose.</li>
          <li>9.4. Return the power bank promptly when your rental ends.</li>
          <li>9.5. Report loss, damage, malfunction, or safety concerns to OKcharge as soon as reasonably possible.</li>
          <li>9.6. Follow reasonable safety and usage instructions provided by OKcharge.</li>
        </ul>
      </Section>

      <Section title="10. Power Bank Safety">
        <p>10.1. OKcharge power banks are intended for charging compatible electronic devices.</p>
        <p>10.2. Do not use an OKcharge power bank if it appears:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>swollen;</li>
          <li>cracked;</li>
          <li>leaking;</li>
          <li>excessively hot;</li>
          <li>physically damaged; or</li>
          <li>otherwise unsafe.</li>
        </ul>
        <p>10.3. If you notice a safety issue, stop using the power bank and contact OKcharge.</p>
        <p>10.4. Do not expose the power bank to fire, water, extreme heat, or other hazardous conditions.</p>
        <p>10.5. Do not attempt to open, repair, modify, or tamper with the power bank.</p>
      </Section>

      <Section title="11. Compatibility and Customer Devices">
        <p>11.1. Customers are responsible for ensuring that their device and charging connection are compatible with the OKcharge power bank.</p>
        <p>11.2. OKcharge does not guarantee compatibility with every electronic device, charging cable, operating system, or hardware configuration.</p>
        <p>11.3. To the extent permitted by applicable law, OKcharge is not responsible for damage resulting from misuse, incompatible equipment, defective customer equipment, unauthorized modifications, or failure to follow reasonable usage and safety instructions.</p>
        <p>11.4. Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited under applicable Nigerian law.</p>
      </Section>

      <Section title="12. Payments">
        <p>12.1. Rental payments are processed through the payment methods provided by OKcharge.</p>
        <p>12.2. OKcharge uses Paystack as a payment processor for applicable transactions.</p>
        <p>12.3. Customers authorize OKcharge to process the payment necessary for the selected rental.</p>
        <p>12.4. Where applicable, customers also authorize OKcharge to process additional charges properly incurred under these Terms, including late-rental charges and applicable replacement or damage charges.</p>
        <p>12.5. Payment information such as card details is processed by the applicable payment provider. OKcharge does not intentionally store customers' full card details on its own servers.</p>
        <p>12.6. If you believe you have been incorrectly charged, contact OKcharge promptly so that the transaction can be reviewed.</p>
      </Section>

      <Section title="13. Refunds">
        <p>13.1. Rental fees are generally non-refundable once the rental has commenced.</p>
        <p>13.2. If a rental cannot be provided because of an OKcharge system or equipment failure, or if you were incorrectly charged, OKcharge may provide an appropriate refund, credit, replacement, or other reasonable remedy after reviewing the circumstances.</p>
        <p>13.3. Nothing in these Terms removes any refund, remedy, or consumer right that cannot lawfully be excluded under applicable Nigerian law.</p>
      </Section>

      <Section title="14. Personal Data and Privacy">
        <p>14.1. OKcharge may collect and process personal information necessary to provide, secure, and manage its rental services.</p>
        <p>14.2. Depending on the rental process, this may include:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>name and contact information;</li>
          <li>phone number;</li>
          <li>email address;</li>
          <li>rental and payment information;</li>
          <li>rental and return location;</li>
          <li>device information;</li>
          <li>photograph, where required for rental verification or security; and</li>
          <li>IMEI information, where lawfully collected and reasonably necessary for rental security, tracking, fraud prevention, or recovery.</li>
        </ul>
        <p>14.3. Personal data will be processed in accordance with applicable Nigerian data-protection laws and the OKcharge Privacy Policy.</p>
        <p>14.4. OKcharge may use personal data for purposes including:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>processing rentals and payments;</li>
          <li>rental verification;</li>
          <li>communicating with customers;</li>
          <li>providing customer support;</li>
          <li>preventing fraud and misuse;</li>
          <li>recovering unreturned equipment;</li>
          <li>improving the service;</li>
          <li>fulfilling legal obligations; and</li>
          <li>sending promotional communications where permitted and, where required, with the customer's consent.</li>
        </ul>
        <p>14.5. OKcharge will take reasonable measures to protect personal data against unauthorized access, loss, misuse, alteration, or disclosure.</p>
        <p>14.6. OKcharge will retain personal data only for as long as reasonably necessary for the purpose for which it was collected, or as required or permitted by applicable law.</p>
        <p>14.7. Personal data may be shared with service providers, payment processors, authorized OKcharge partners, professional advisers, or law-enforcement authorities where reasonably necessary and permitted or required by law.</p>
        <p>14.8. Your rights concerning your personal data are described in the OKcharge Privacy Policy.</p>
      </Section>

      <Section title="15. Fraud, Abuse and Misuse">
        <p>15.1. OKcharge may suspend or terminate access to its services where there is reasonable evidence of:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>fraud or attempted fraud;</li>
          <li>payment abuse;</li>
          <li>deliberate equipment damage;</li>
          <li>unauthorized interference with the OKcharge platform;</li>
          <li>repeated failure to return equipment;</li>
          <li>provision of false information;</li>
          <li>unauthorized use of another person's payment method; or</li>
          <li>other serious misuse of the service.</li>
        </ul>
        <p>15.2. Where appropriate, OKcharge may cooperate with relevant authorities concerning suspected unlawful activity.</p>
        <p>15.3. Any report to law enforcement will be made based on the circumstances and applicable law.</p>
      </Section>

      <Section title="16. Partner Locations">
        <p>16.1. OKcharge may provide its services through independent partner locations.</p>
        <p>16.2. Authorized partners may assist with issuing, receiving, or managing OKcharge power banks.</p>
        <p>16.3. Partners are expected to follow the procedures and requirements established by OKcharge for handling customer rentals and equipment.</p>
        <p>16.4. The availability and operating hours of partner locations may vary.</p>
        <p>16.5. OKcharge is not responsible for services independently provided by a partner that are outside the partner's authorized role in the OKcharge rental service.</p>
      </Section>

      <Section title="17. Service Availability">
        <p>17.1. OKcharge aims to provide a reliable and convenient rental service but does not guarantee uninterrupted availability.</p>
        <p>17.2. Temporary interruptions may occur because of:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>network or telecommunications failures;</li>
          <li>payment-provider outages;</li>
          <li>technical problems;</li>
          <li>equipment shortages;</li>
          <li>maintenance;</li>
          <li>power outages;</li>
          <li>third-party service failures; or</li>
          <li>circumstances outside OKcharge's reasonable control.</li>
        </ul>
        <p>17.3. Where reasonably possible, OKcharge will work to restore affected services and assist customers experiencing genuine rental problems.</p>
      </Section>

      <Section title="18. Limitation of Liability">
        <p>18.1. To the maximum extent permitted by applicable law, OKcharge will not be liable for indirect, incidental, special, or consequential losses arising from a customer's use of the service where such losses were not reasonably foreseeable.</p>
        <p>18.2. OKcharge will not be responsible for losses resulting from:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>misuse of a power bank;</li>
          <li>use with incompatible or defective equipment;</li>
          <li>unauthorized modification or repair;</li>
          <li>failure to follow safety instructions; or</li>
          <li>circumstances outside OKcharge's reasonable control.</li>
        </ul>
        <p>18.3. Nothing in these Terms excludes, restricts, or limits liability where such exclusion, restriction, or limitation is prohibited by Nigerian law.</p>
        <p>18.4. Any limitation or exclusion of liability contained in these Terms is intended to apply only to the extent permitted by applicable law.</p>
      </Section>

      <Section title="19. Complaints and Dispute Resolution">
        <p>19.1. If you have a complaint concerning a rental, payment, power bank, personal data, or any other aspect of the OKcharge service, please contact us first so that we can investigate and attempt to resolve the matter.</p>
        
        <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '8px', margin: '15px 0', borderLeft: '4px solid #10b981' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>OKcharge Contact Information:</p>
          <p style={{ margin: '5px 0' }}>📍 Location: Akure, Ondo State, Nigeria</p>
          <p style={{ margin: '5px 0' }}> Phone/WhatsApp: +234 703 238 5674</p>
          <p style={{ margin: '5px 0' }}>✉️ Email: support@okcharge.ng</p>
        </div>

        <p>19.2. We will review legitimate complaints and seek to resolve them within a reasonable period.</p>
        <p>19.3. Nothing in these Terms prevents a customer from exercising any statutory consumer rights or pursuing any remedy available under applicable Nigerian law.</p>
      </Section>

      <Section title="20. Changes to These Terms">
        <p>20.1. OKcharge may update these Terms when reasonably necessary, including where there are changes to:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>the OKcharge service;</li>
          <li>rental prices;</li>
          <li>technology;</li>
          <li>business operations;</li>
          <li>applicable laws or regulations; or</li>
          <li>security requirements.</li>
        </ul>
        <p>20.2. The latest version will be published on the OKcharge website together with the applicable "Last Updated" date.</p>
        <p>20.3. Changes will not retroactively alter a completed rental or remove rights that cannot legally be removed.</p>
      </Section>

      <Section title="21. Governing Law">
        <p>21.1. These Terms are governed by the laws of the Federal Republic of Nigeria.</p>
        <p>21.2. Subject to any mandatory rights or remedies available to consumers under Nigerian law, disputes relating to these Terms or the OKcharge service shall be subject to the jurisdiction of the appropriate courts in Nigeria.</p>
      </Section>

      <Section title="22. Severability">
        <p>If any provision of these Terms is found to be invalid, unlawful, or unenforceable, that provision will be modified or interpreted to the minimum extent necessary to make it enforceable, and the remaining provisions will continue in full effect.</p>
      </Section>

      <Section title="23. Entire Agreement">
        <p>These Terms, together with the OKcharge Privacy Policy and any other terms expressly presented to you during the rental process, constitute the agreement governing your use of the OKcharge rental service.</p>
        <p>If there is a conflict between these Terms and a mandatory requirement of Nigerian law, the mandatory legal requirement will prevail.</p>
      </Section>

      <div style={{ marginTop: '40px', padding: '25px', backgroundColor: '#0f172a', borderRadius: '12px', color: 'white' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>Contact OKcharge</h3>
        <p style={{ margin: '5px 0' }}><strong>OKcharge — Power Bank Rentals</strong></p>
        <p style={{ margin: '5px 0' }}>📍 Akure, Ondo State, Nigeria</p>
        <p style={{ margin: '5px 0' }}> +234 703 238 5674</p>
        <p style={{ margin: '5px 0' }}>✉️ support@okcharge.ng</p>
      </div>
    </main>
  );
}

// Helper component for sections
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '30px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginTop: '30px', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
