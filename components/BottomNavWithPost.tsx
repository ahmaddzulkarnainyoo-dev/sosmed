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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 px-2 z-50 shadow-lg md:hidden">
      <Link href="/feed" className={`flex flex-col items-center ${pathname === '/feed' ? 'text-blue-600' : 'text-gray-500'}`}>
        <span className="text-2xl">🏠</span>
        <span className="text-[11px]">Beranda</span>
      </Link>
      <Link href="/directory" className={`flex flex-col items-center ${pathname === '/directory' ? 'text-blue-600' : 'text-gray-500'}`}>
        <span className="text-2xl">👥</span>
        <span className="text-[11px]">Direktori</span>
      </Link>
      {/* Tombol posting di tengah */}
      <button onClick={() => router.push('/create-post')} className="flex flex-col items-center justify-center bg-blue-600 text-white rounded-full w-12 h-12 -mt-6 shadow-md">
        <span className="text-2xl">+</span>
        <span className="text-[10px]">Posting</span>
      </button>
      <Link href="/notifications" className={`flex flex-col items-center relative ${pathname === '/notifications' ? 'text-blue-600' : 'text-gray-500'}`}>
        <span className="text-2xl">❤️</span>
        {unreadCount > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        <span className="text-[11px]">Notifikasi</span>
      </Link>
      <Link href="/profile/me" className={`flex flex-col items-center ${pathname.startsWith('/profile/') ? 'text-blue-600' : 'text-gray-500'}`}>
        <span className="text-2xl">👤</span>
        <span className="text-[11px]">Profil</span>
      </Link>
    </div>
  );
}