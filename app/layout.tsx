import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Nokos Free By SANN404 FORUM GROUP',
  description: 'Website penyedia nomer virtual.',
  openGraph: {
    title: 'Nokos Free By SANN404 FORUM GROUP',
    description: 'Website penyedia nomer virtual.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nokos Free By SANN404 FORUM GROUP',
    description: 'Website penyedia nomer virtual.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
