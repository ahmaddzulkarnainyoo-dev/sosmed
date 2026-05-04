'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function TopNavbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };
    fetchUnread();
  }, [user]);

  if (!user) return null; // tidak muncul sebelum login

  const navItems = [
    { name: 'Beranda', href: '/feed', icon: '🏠' },
    { name: 'Direktori', href: '/directory', icon: '👥' },
    { name: 'Notifikasi', href: '/notifications', icon: '❤️', badge: unreadCount },
    { name: 'Pesan', href: '/messages', icon: '💬' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">
        <Link href="/feed" className="text-xl font-bold text-blue-600">Himlab</Link>
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className={`relative flex items-center space-x-1 ${pathname === item.href ? 'text-blue-600' : 'text-gray-600'}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="hidden sm:inline">{item.name}</span>
              {item.badge ? (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-1 min-w-[18px] h-[18px] flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </Link>
          ))}
          <Link href="/profile/me" className={`flex items-center space-x-1 ${pathname.startsWith('/profile/') ? 'text-blue-600' : 'text-gray-600'}`}>
            <span className="text-xl">👤</span>
            <span className="hidden sm:inline">Profil</span>
          </Link>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
            className="text-red-500 flex items-center space-x-1"
          >
            <span className="text-xl">🚪</span>
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </nav>
  );
}