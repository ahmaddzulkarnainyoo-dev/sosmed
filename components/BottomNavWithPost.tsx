'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function BottomNavWithPost() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (user) {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        setUnreadCount(count || 0);
      }
    };
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  if (!isLoggedIn) return null;

  const navItems = [
    { name: 'Beranda', href: '/feed', icon: '🏠' },
    { name: 'Direktori', href: '/directory', icon: '👥' },
    { name: 'Posting', href: '/create-post', icon: '➕', isCenter: true },
    { name: 'Notifikasi', href: '/notifications', icon: '❤️', badge: unreadCount },
    { name: 'Profil', href: '/profile/me', icon: '👤' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 px-2 z-50 shadow-lg md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        if (item.isCenter) {
          return (
            <button
              key={item.name}
              onClick={() => router.push('/create-post')}
              className="flex flex-col items-center justify-center bg-blue-600 text-white rounded-full w-12 h-12 -mt-6 shadow-md"
            >
              <span className="text-2xl">{item.icon}</span>
            </button>
          );
        }
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