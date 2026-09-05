import type { Metadata } from "next";
import { Inter } from "next/font/google";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OKcharge - Power Bank Rental",
  description: "Rent a power bank easily and securely with OKcharge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ 
        margin: 0, 
        padding: 0, 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ flex: 1 }}>
          {children}
        </div>
        
        {/* 🚀 Global Footer */}
        <Footer />
        
        {/* 🚀 Global WhatsApp Button */}
        <WhatsAppButton />
        
      </body>
    </html>
  );
}
