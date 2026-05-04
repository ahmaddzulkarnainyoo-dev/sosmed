import TopNavbar from '@/components/TopNavbar';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TopNavbar />
        <main className="pb-20 md:pb-0">{children}</main>
      </body>
    </html>
  );
}