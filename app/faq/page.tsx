'use client';
import { useState } from 'react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    { 
      question: 'How do I rent a power bank?', 
      answer: `It's super simple! Just follow these steps:
1. Find an OKcharge station at your favorite store, cafe, or restaurant
2. Scan the QR code on the station with your phone camera
3. Choose your rental duration and pay securely via Paystack
4. Show your ticket code to the location staff
5. Staff will scan and unlock a power bank for you
6. Grab it and start charging!` 
    },
    { 
      question: 'Where can I find OKcharge stations?', 
      answer: 'You can find OKcharge stations at participating stores, cafes, restaurants, hotels, and other public locations. Look for the OKcharge branding and QR code on the power bank station. We are expanding to more locations every week!' 
    },
    { 
      question: 'Do I need to download an app?', 
      answer: 'No app needed! Simply scan the QR code at any OKcharge location with your phone camera, and you will be directed to our web platform where you can rent a power bank instantly.' 
    },
    { 
      question: 'How much does it cost?', 
      answer: `Our pricing is simple and affordable:
• 1 Hour - ₦100
• 3 Hours - ₦200
• 5 Hours - ₦300
• 24 Hours - ₦800
Choose the duration that fits your needs!` 
    },
    { 
      question: 'What happens if I return the power bank late?', 
      answer: 'We send you reminder notifications 15 minutes before your rental expires. If you exceed your rental time, additional charges will apply based on the extended duration. Just return it to the same location where you rented it.' 
    },
    { 
      question: 'Can I return the power bank to a different location?', 
      answer: 'Currently, power banks must be returned to the same location where they were rented. This helps us maintain our inventory and service quality. We are working on enabling cross-location returns soon!' 
    },
    { 
      question: 'Is my payment secure?', 
      answer: 'Absolutely! We use Paystack, a PCI-DSS certified payment processor trusted by thousands of businesses in Nigeria, to handle all transactions. Your payment information is always secure and encrypted.' 
    },
    { 
      question: 'What if the power bank is not working?', 
      answer: 'If you experience any issues with your power bank, contact us immediately via WhatsApp or inform the staff at your location. We will replace it immediately or refund your payment right away. Your satisfaction is our priority!' 
    },
    { 
      question: 'How do I become a location partner?', 
      answer: 'Great question! Visit our registration page to sign up as a location partner. You can earn 40% revenue share if we provide the power banks, or up to 75% if you provide your own power banks. We handle all the hardware, maintenance, and technical support for standard partnerships.' 
    },
    { 
      question: 'Do I need to create an account to rent?', 
      answer: 'No account creation needed! Just enter your details at checkout and you are good to go. We make it super simple and fast so you can get charging immediately.' 
    },
    { 
      question: 'What types of phones can I charge?', 
      answer: 'Our power banks come with multiple cable types (Lightning for iPhone, USB-C for Android, and Micro-USB) so they work with virtually all smartphones and tablets. We also have high-capacity banks that can charge multiple devices.' 
    },
    { 
      question: 'How do I contact customer support?', 
      answer: `You can reach us via:
• WhatsApp: +234 703 238 5674 (fastest response)
• Email: support@okcharge.ng
• Click the green WhatsApp button on any page of our website
We typically respond within minutes during business hours!` 
    }
  ];

  return (
    <main style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f172a', marginBottom: '15px' }}>Frequently Asked Questions</h1>
        <p style={{ fontSize: '18px', color: '#64748b' }}>Find answers to common questions about OKcharge</p>
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        {faqs.map((faq, index) => (
          <div key={index} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '15px', overflow: 'hidden' }}>
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
              <span style={{ fontSize: '24px', color: '#2563eb' }}>{openIndex === index ? '−' : '+'}</span>
            </button>
            {openIndex === index && (
              <div style={{ 
                padding: '0 20px 20px', 
                fontSize: '15px', 
                color: '#475569', 
                lineHeight: '1.8', 
                borderTop: '1px solid #f1f5f9', 
                paddingTop: '15px',
                whiteSpace: 'pre-line'
              }}>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div style={{ backgroundColor: '#eff6ff', padding: '30px', borderRadius: '12px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', color: '#1e40af', marginBottom: '15px' }}>Still have questions?</h2>
        <p style={{ fontSize: '16px', color: '#475569', marginBottom: '20px' }}>Can't find the answer you are looking for? We are here to help!</p>
        <a href="/contact" style={{ display: 'inline-block', backgroundColor: '#2563eb', color: 'white', padding: '15px 30px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px' }}>Contact Support</a>
      </div>
    </main>
  );
}
