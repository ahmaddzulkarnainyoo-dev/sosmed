import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ChatRoom from '@/components/ChatRoom';

export default async function ChatDetailPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  // Ambil data user lain
  const { data: otherUser, error } = await supabase
    .from('profiles')
    .select('id, username, full_name')
    .eq('username', username)
    .single();
  if (error || !otherUser) notFound();

  // Ambil user login
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-4">Silakan login</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border-b p-3 sticky top-0">
        <h1 className="font-bold">{otherUser.full_name || otherUser.username}</h1>
        <p className="text-xs text-gray-500">@{otherUser.username}</p>
      </div>
      <ChatRoom
        currentUserId={user.id}
        otherUserId={otherUser.id}
        otherUsername={otherUser.username}
      />
    </div>
  );
}