import type { Metadata } from 'next';

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
      <body style={{ margin: 0, padding: 0, backgroundColor: '#ffffff' }}>
        {children}
      </body>
    </html>
  );
}
