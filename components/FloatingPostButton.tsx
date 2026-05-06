'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function FloatingPostButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  if (!isLoggedIn) return null;

  return (
    <button
      onClick={() => router.push('/create-post')}
      className="fixed bottom-20 right-4 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition z-50"
    >
      <span className="text-3xl">+</span>
    </button>
  );
}