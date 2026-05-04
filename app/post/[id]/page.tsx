import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CommentSection from '@/components/CommentSection';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-4">Silakan login</div>;

  const { data: post, error } = await supabase
    .from('posts')
    .select('*, profiles (id, username, full_name, avatar_url, role)')
    .eq('id', id)
    .single();

  if (error || !post) notFound();

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center gap-3 mb-2">
          <img src={post.profiles?.avatar_url || '/default-avatar.png'} className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-semibold">{post.profiles?.full_name || post.profiles?.username}</p>
            <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
          </div>
        </div>
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        {post.image_url && <img src={post.image_url} className="mt-2 rounded-lg" />}
      </div>
      <CommentSection postId={id} currentUserId={user.id} />
    </div>
  );
}