'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
}

export default function ChatRoom({ currentUserId, otherUserId, otherUsername }: { currentUserId: string; otherUserId: string; otherUsername: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll ke bawah setiap ada pesan baru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load pesan awal
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
      setLoading(false);
      scrollToBottom();
    };
    fetchMessages();

    // Subscribe ke pesan baru (real-time)
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          // Hanya terima pesan yang melibatkan kedua user
          if (
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === otherUserId) ||
            (newMsg.sender_id === otherUserId && newMsg.receiver_id === currentUserId)
          ) {
            setMessages((prev) => [...prev, newMsg]);
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId]);

  // Kirim pesan
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: otherUserId,
      content: newMessage.trim(),
    });
    if (!error) {
      setNewMessage('');
      scrollToBottom();
    } else {
      alert('Gagal kirim pesan');
    }
    setSending(false);
  };

  if (loading) return <div className="p-4">Memuat chat...</div>;

  return (
    <div className="flex flex-col h-screen max-h-[calc(100vh-120px)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-xl px-4 py-2 ${
                  isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: id })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="border-t p-3 bg-white flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="bg-blue-500 text-white px-5 py-2 rounded-full disabled:opacity-50"
        >
          Kirim
        </button>
      </form>
    </div>
  );
}