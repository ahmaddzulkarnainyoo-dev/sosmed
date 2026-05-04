'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  console.log('BottomNav rendered, pathname:', pathname); // untuk debugging

  const navItems = [
    { name: 'Beranda', href: '/feed', icon: '🏠' },
    { name: 'Cari', href: '/directory', icon: '🔍' },
    { name: 'Pesan', href: '/messages', icon: '💬' },
    { name: 'Profilku', href: '/profile/me', icon: '👤' },
  ];

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #ddd', display: 'flex', justifyContent: 'space-around', padding: '8px', zIndex: 9999 }}>
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
        return (
          <Link key={item.name} href={item.href} style={{ textDecoration: 'none', color: isActive ? 'blue' : 'gray', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '24px' }}>{item.icon}</span>
            <span style={{ fontSize: '12px' }}>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}