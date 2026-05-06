'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const navLinks = [
    { href: '/feed', label: 'Beranda' },
    { href: '/directory', label: 'Direktori' },
    { href: '/notifications', label: 'Notifikasi' },
    { href: '/messages', label: 'Pesan' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">
        <Link href="/feed" className="text-xl font-bold text-blue-600">
          HIMLAB
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                pathname === href ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </Link>
          ))}

          <button
            onClick={() => router.push('/create-post')}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Posting
          </button>

          {/* Avatar + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(prev => !prev)}>
              <img
                src={user.user_metadata?.avatar_url || '/default-avatar.png'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 hover:ring-blue-400 transition-all"
                alt="avatar"
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border border-gray-100 py-1 z-50">
                <Link
                  href="/profile/me"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Profil Saya
                </Link>
                <Link
                  href="/profile/me/edit"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Edit Profil
                </Link>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setDropdownOpen(false);
                    router.push('/auth');
                  }}
                  className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}