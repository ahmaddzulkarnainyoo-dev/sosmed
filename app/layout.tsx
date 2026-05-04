import TopNavbar from '@/components/TopNavbar';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <TopNavbar />
        <main className="pb-20 md:pb-0">{children}</main>
      </body>
    </html>
  );
}