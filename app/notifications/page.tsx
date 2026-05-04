'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchNotifs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('notifications')
        .select('*, source:source_user_id (username, full_name, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setNotifs(data || []);
      // Mark as read
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    };
    fetchNotifs();
  }, []);

  if (notifs.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="text-6xl mb-4">🔔</div>
        <h2 className="text-xl font-semibold text-gray-700">Belum ada notifikasi</h2>
        <p className="text-gray-400 mt-2">Saat ada yang menyukai atau mengikuti Anda, akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">Notifikasi</h1>
      <div className="space-y-3">
        {notifs.map((notif) => (
          <div key={notif.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <img src={notif.source?.avatar_url || '/default-avatar.png'} className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Link href={`/profile/${notif.source?.username}`} className="font-semibold hover:underline">
                {notif.source?.full_name || notif.source?.username}
              </Link>
              <span className="text-gray-600 ml-1">
                {notif.type === 'like' ? 'menyukai postinganmu' : notif.type === 'follow' ? 'mengikutimu' : 'berkomentar'}
              </span>
              <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
            </div>
            {!notif.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
          </div>
        ))}
      </div>
    </div>
  );
}