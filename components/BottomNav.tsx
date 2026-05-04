'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function BottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (!user) return;

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };
    checkUser();

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        supabase.auth.getUser().then(({ data }) => {
          if (data.user && payload.new.user_id === data.user.id) {
            setUnreadCount(prev => prev + 1);
          }
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Jika belum login, jangan tampilkan apa-apa
  if (!isLoggedIn) return null;

  const navItems = [
    { name: 'Beranda', href: '/feed', icon: '🏠', activeIcon: '🏠' },
    { name: 'Cari', href: '/directory', icon: '🔍', activeIcon: '🔍' },
    { name: 'Notifikasi', href: '/notifications', icon: '❤️', activeIcon: '❤️', badge: unreadCount },
    { name: 'Pesan', href: '/messages', icon: '💬', activeIcon: '💬' },
    { name: 'Profil', href: '/profile/me', icon: '👤', activeIcon: '👤' },
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
              <span className="text-2xl">{isActive ? item.activeIcon : item.icon}</span>
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