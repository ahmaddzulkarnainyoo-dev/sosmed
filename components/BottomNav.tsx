'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Beranda', href: '/feed', icon: '🏠' },
    { name: 'Cari', href: '/directory', icon: '🔍' },
    { name: 'Pesan', href: '/messages', icon: '💬' },
    { name: 'Profilku', href: '/profile/me', icon: '👤' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 px-4 z-50 md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center text-xs ${
              isActive ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}