'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

export default function ChatDetailPage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [receiver, setReceiver] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }
      setCurrentUserId(user.id);
      const { data: receiverData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('username', username)
        .single();
      if (!receiverData) { router.push('/directory'); return; }
      setReceiver(receiverData);
      setLoading(false);
    };
    fetchData();
  }, [username]);

  useEffect(() => {
    if (!currentUserId || !receiver) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${receiver.id}),and(sender_id.eq.${receiver.id},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    const channel = supabase
      .channel(`chat-${[currentUserId, receiver.id].sort().join('-')}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const newMsg = payload.new as Message;
        if (
          (newMsg.sender_id === currentUserId && newMsg.receiver_id === receiver.id) ||
          (newMsg.sender_id === receiver.id && newMsg.receiver_id === currentUserId)
        ) {
          setMessages(prev => [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, receiver]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !currentUserId || !receiver) return;
    setSending(true);
    await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: receiver.id,
      content: newMessage.trim(),
    });
    setNewMessage('');
    setSending(false);
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 pt-4 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200" />
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-16 z-10">
        <Link href="/messages" className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <img
          src={receiver?.avatar_url || '/default-avatar.png'}
          className="w-9 h-9 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">
            {receiver?.full_name || receiver?.username}
          </p>
          <p className="text-xs text-gray-400">@{receiver?.username}</p>
        </div>
        <Link
          href={`/profile/${receiver?.username}`}
          className="text-xs text-blue-500 hover:underline flex-shrink-0"
        >
          Profil
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-12">
            Belum ada pesan. Mulai percakapan!
          </p>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                isMe
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-900 rounded-bl-sm border border-gray-100'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: id })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-400 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="bg-blue-600 disabled:bg-blue-300 text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </form>
    </div>
  );
}