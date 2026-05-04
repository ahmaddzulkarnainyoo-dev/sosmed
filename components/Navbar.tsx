'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };
    fetchUnreadCount();

    // Subscribe ke notifikasi baru (realtime)
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.new.user_id === supabase.auth.getUser().then(({ data }) => data.user?.id)) {
          setUnreadCount((prev) => prev + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/feed" className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Himlab
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/feed" className="text-gray-700 hover:text-blue-600 transition">Beranda</Link>
            <Link href="/directory" className="text-gray-700 hover:text-blue-600 transition">Direktori</Link>
            <Link href="/messages" className="text-gray-700 hover:text-blue-600 transition">Pesan</Link>
            <Link href="/notifications" className="relative text-gray-700 hover:text-blue-600 transition">
              Notifikasi
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link href="/profile/me" className="text-gray-700 hover:text-blue-600 transition">Profil</Link>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl">☰</button>
        </div>
        {menuOpen && <MobileMenu setMenuOpen={setMenuOpen} unreadCount={unreadCount} />}
      </div>
    </nav>
  );
}

function MobileMenu({ setMenuOpen, unreadCount }: { setMenuOpen: (v: boolean) => void; unreadCount: number }) {
  return (
    <div className="md:hidden pb-4 space-y-2">
      <Link href="/feed" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>Beranda</Link>
      <Link href="/directory" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>Direktori</Link>
      <Link href="/messages" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>Pesan</Link>
      <Link href="/notifications" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>
        Notifikasi {unreadCount > 0 && `(${unreadCount})`}
      </Link>
      <Link href="/profile/me" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>Profil</Link>
    </div>
  );
}