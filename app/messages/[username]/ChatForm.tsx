'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ChatForm({ receiverId, currentUserId }: { receiverId: string; currentUserId: string }) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUserId,
        receiver_id: receiverId,
        content: message,
      });
      if (error) throw error;
      setMessage('');
    } catch (error) {
      console.error(error);
      alert('Gagal mengirim pesan');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t bg-white">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ketik pesan..."
        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
      />
      <button
        type="submit"
        disabled={isSending || !message.trim()}
        className="bg-blue-600 text-white px-4 py-2 rounded-full disabled:opacity-50"
      >
        Kirim
      </button>
    </form>
  );
}