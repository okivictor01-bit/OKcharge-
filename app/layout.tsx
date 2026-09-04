import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OKcharge Platform',
  description: 'Power Bank Rental Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://js.paystack.co/v1/inline.js" />
      </head>
      <body>{children}</body>
    </html>
  );
}
