import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ChatForm from './ChatForm';

export default async function ChatDetailPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: receiver, error } = await supabase
    .from('profiles')
    .select('id, username, full_name')
    .eq('username', username)
    .single();
  if (error || !receiver) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-4">Silakan login</div>;

  // Ambil pesan antara dua user
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiver.id}),and(sender_id.eq.${receiver.id},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });

  return (
    <div className="max-w-2xl mx-auto p-4 h-screen flex flex-col">
      <div className="flex items-center gap-3 border-b pb-3">
        <Link href="/messages" className="text-blue-500">←</Link>
        <h1 className="text-xl font-bold">{receiver.full_name || receiver.username}</h1>
      </div>
      <div className="flex-1 overflow-y-auto my-4 space-y-2">
        {messages?.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs p-2 rounded-lg ${msg.sender_id === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <ChatForm receiverId={receiver.id} currentUserId={user.id} />
    </div>
  );
}