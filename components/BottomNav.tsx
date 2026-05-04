'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function BottomNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
      if (session?.user) fetchUnreadCount(session.user.id);
    });
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (user) fetchUnreadCount(user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchUnreadCount = async (userId: string) => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    setUnreadCount(count || 0);
  };

  if (!isLoggedIn) return null;

  const navItems = [
    { name: 'Beranda', href: '/feed', icon: '🏠' },
    { name: 'Cari', href: '/directory', icon: '🔍' },
    { name: 'Notifikasi', href: '/notifications', icon: '❤️', badge: unreadCount },
    { name: 'Pesan', href: '/messages', icon: '💬' },
    { name: 'Profil', href: '/profile/me', icon: '👤' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 px-2 z-50 shadow-lg md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center py-1 px-3 rounded-full transition-all ${
              isActive ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <div className="relative">
              <span className="text-2xl">{item.icon}</span>
              {item.badge ? (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[11px] mt-0.5">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}