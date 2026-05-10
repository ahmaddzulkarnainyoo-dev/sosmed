'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface Conversation {
  userId: string;
  username: string;
  full_name: string;
  avatar_url: string;
  lastMessage: string;
  lastTime: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchConversations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }
      setCurrentUserId(user.id);

      // Ambil semua pesan yang melibatkan user ini
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!messages) { setLoading(false); return; }

      // Ambil unique conversation partners
      const partnerIds = new Set<string>();
      const lastMessages: Record<string, typeof messages[0]> = {};

      messages.forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!partnerIds.has(partnerId)) {
          partnerIds.add(partnerId);
          lastMessages[partnerId] = msg;
        }
      });

      if (partnerIds.size === 0) { setLoading(false); return; }

      // Ambil profil semua partner sekaligus
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', Array.from(partnerIds));

      const convos: Conversation[] = (profiles || []).map(profile => ({
        userId: profile.id,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        lastMessage: lastMessages[profile.id]?.content || '',
        lastTime: lastMessages[profile.id]?.created_at || '',
      }));

      // Sort by last message time
      convos.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
      setConversations(convos);
      setLoading(false);
    };

    fetchConversations();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-900">Pesan</h1>
        <Link
          href="/directory"
          className="text-sm text-blue-500 hover:underline"
        >
          + Pesan baru
        </Link>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-32" />
                <div className="h-2.5 bg-gray-100 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && conversations.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-sm mb-3">Belum ada percakapan.</p>
          <Link
            href="/directory"
            className="text-sm text-blue-500 hover:underline"
          >
            Cari anggota untuk dikirim pesan
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {conversations.map(convo => (
          <Link
            key={convo.userId}
            href={`/messages/${convo.username}`}
            className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all"
          >
            <img
              src={convo.avatar_url || '/default-avatar.png'}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              alt={convo.username}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {convo.full_name || convo.username}
                </p>
                {convo.lastTime && (
                  <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(convo.lastTime), { addSuffix: false, locale: id })}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {convo.lastMessage || '—'}
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 flex-shrink-0">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}