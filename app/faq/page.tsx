'use client';

import { useState } from 'react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I rent a power bank?',
      answer: 'Simply visit our Rent page, select your location, choose your rental duration, enter your details, and pay securely via Paystack. You'll receive a ticket code which you show to the staff to collect your power bank.'
    },
    {
      question: 'How much does it cost?',
      answer: 'Our pricing is simple and affordable: 1 Hour - ₦100, 6 Hours - ₦300, 12 Hours - ₦500, 24 Hours - ₦800. Choose the duration that fits your needs!'
    },
    {
      question: 'What happens if I return the power bank late?',
      answer: 'We send you reminder notifications 15 minutes before your rental expires. If you exceed your rental time, additional charges will apply based on the extended duration.'
    },
    {
      question: 'Can I return the power bank to a different location?',
      answer: 'Currently, power banks must be returned to the same location where they were rented. We're working on enabling cross-location returns soon!'
    },
    {
      question: 'Is my payment secure?',
      answer: 'Absolutely! We use Paystack, a PCI-DSS certified payment processor, to handle all transactions. Your payment information is always secure.'
    },
    {
      question: 'What if the power bank is not working?',
      answer: 'If you experience any issues with your power bank, contact us immediately via WhatsApp or the staff at your location. We'll replace it or refund your payment right away.'
    },
    {
      question: 'How do I become a location partner?',
      answer: 'Great question! Visit our registration page to sign up as a location partner. You'll earn 30% revenue share on every rental made at your location. We handle all the hardware and maintenance.'
    },
    {
      question: 'Do I need to create an account to rent?',
      answer: 'No account creation needed! Just enter your details at checkout and you're good to go. We make it super simple.'
    },
    {
      question: 'What types of phones can I charge?',
      answer: 'Our power banks come with multiple cable types (Lightning for iPhone, USB-C, and Micro-USB) so they work with virtually all smartphones and tablets.'
    },
    {
      question: 'How do I contact customer support?',
      answer: 'You can reach us via WhatsApp at +234 703 238 5674 (fastest response), email at support@okcharge.ng, or click the green WhatsApp button on any page of our website.'
    }
  ];

  return (
    <main style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>Frequently Asked Questions</h1>
      <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '40px' }}>Find answers to common questions about OKcharge.</p>

      <div style={{ marginBottom: '40px' }}>
        {faqs.map((faq, index) => (
          <div key={index} style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            marginBottom: '15px',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              style={{
                width: '100%',
                padding: '20px',
                backgroundColor: 'white',
                border: 'none',
                textAlign: 'left',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#0f172a',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{faq.question}</span>
              <span style={{ fontSize: '24px', color: '#2563eb' }}>
                {openIndex === index ? '−' : '+'}
              </span>
            </button>
            
            {openIndex === index && (
              <div style={{ 
                padding: '0 20px 20px', 
                fontSize: '15px', 
                color: '#475569', 
                lineHeight: '1.6',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '15px'
              }}>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ 
        backgroundColor: '#eff6ff', 
        padding: '30px', 
        borderRadius: '12px', 
        border: '1px solid #bfdbfe',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '24px', color: '#1e40af', marginBottom: '15px' }}>Still have questions?</h2>
        <p style={{ fontSize: '16px', color: '#475569', marginBottom: '20px' }}>
          Can't find the answer you're looking for? We're here to help!
        </p>
        <a href="/contact" style={{ 
          display: 'inline-block',
          backgroundColor: '#2563eb', 
          color: 'white', 
          padding: '15px 30px', 
          borderRadius: '8px', 
          textDecoration: 'none', 
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          Contact Support
        </a>
      </div>
    </main>
  );
}
