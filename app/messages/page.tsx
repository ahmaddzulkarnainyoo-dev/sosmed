'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  sender_id: string;
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

  // Ambil current user & receiver
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setCurrentUserId(user.id);

      // Ambil receiver berdasarkan username
      const { data: receiverData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('username', username)
        .single();
      if (!receiverData) {
        router.push('/directory');
        return;
      }
      setReceiver(receiverData);
      setLoading(false);
    };
    fetchData();
  }, [username]);

  // Ambil pesan dan subscribe realtime
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

    // Subscribe ke pesan baru
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as Message;
        // Hanya tambahkan jika pesan milik percakapan ini
        if (
          (newMsg.sender_id === currentUserId && newMsg.receiver_id === receiver.id) ||
          (newMsg.sender_id === receiver.id && newMsg.receiver_id === currentUserId)
        ) {
          setMessages((prev) => [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, receiver]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !currentUserId || !receiver) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: receiver.id,
      content: newMessage.trim(),
    });
    if (error) {
      alert('Gagal kirim: ' + error.message);
    } else {
      setNewMessage('');
    }
    setSending(false);
  };

  if (loading) return <div className="p-4">Memuat...</div>;
  if (!receiver) return <div className="p-4">User tidak ditemukan</div>;

  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col p-4 pb-20">
      <div className="flex items-center gap-3 border-b pb-3 mb-4">
        <Link href="/messages" className="text-blue-500 text-xl">←</Link>
        <img src={receiver.avatar_url || '/default-avatar.png'} className="w-10 h-10 rounded-full" />
        <div>
          <h1 className="font-bold">{receiver.full_name || receiver.username}</h1>
          <p className="text-xs text-gray-500">@{receiver.username}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg px-3 py-2 ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <p className="text-sm">{msg.content}</p>
                <p className="text-[10px] opacity-70 mt-1 text-right">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: id })}</p>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" disabled={sending || !newMessage.trim()} className="bg-blue-500 text-white px-4 py-2 rounded-xl">
          Kirim
        </button>
      </form>
    </div>
  );
}