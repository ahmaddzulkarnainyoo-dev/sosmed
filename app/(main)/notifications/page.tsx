'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id);
    };
    fetchNotifs();
  }, []);

  const getNotifText = (type: string) => {
    if (type === 'like') return 'menyukai postinganmu';
    if (type === 'follow') return 'mulai mengikutimu';
    if (type === 'comment') return 'mengomentari postinganmu';
    return 'berinteraksi denganmu';
  };

  const getNotifIcon = (type: string) => {
    if (type === 'like') return '❤️';
    if (type === 'follow') return '👤';
    if (type === 'comment') return '💬';
    return '🔔';
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 pt-4 space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-48" />
            <div className="h-2.5 bg-gray-100 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );

  if (notifs.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <h1 className="text-lg font-bold text-gray-900 mb-4">Notifikasi</h1>
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">🔔</p>
        <p className="text-sm">Belum ada notifikasi.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      <h1 className="text-lg font-bold text-gray-900 mb-4">Notifikasi</h1>
      <div className="space-y-2">
        {notifs.map(notif => (
          <Link
            key={notif.id}
            href={
              notif.type === 'follow'
                ? `/profile/${notif.source?.username}`
                : notif.post_id
                ? `/post/${notif.post_id}`
                : `/profile/${notif.source?.username}`
            }
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
              !notif.is_read
                ? 'bg-blue-50 border-blue-100'
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={notif.source?.avatar_url || '/default-avatar.png'}
                className="w-11 h-11 rounded-full object-cover"
                alt={notif.source?.username}
              />
              <span className="absolute -bottom-0.5 -right-0.5 text-sm">
                {getNotifIcon(notif.type)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">
                  {notif.source?.full_name || notif.source?.username}
                </span>{' '}
                <span className="text-gray-600">{getNotifText(notif.type)}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
              </p>
            </div>
            {!notif.is_read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}