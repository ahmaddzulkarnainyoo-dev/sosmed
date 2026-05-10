import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import CommentSection from '@/components/CommentSection';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: post, error } = await supabase
    .from('posts')
    .select('*, profiles:author_id (id, username, full_name, avatar_url, role)')
    .eq('id', postId)
    .single();

  if (error || !post) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      {/* Back */}
      <Link
        href="/feed"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Kembali
      </Link>

      {/* Post */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
        <div className="p-4">
          <Link
            href={`/profile/${post.profiles?.username}`}
            className="flex items-center gap-3 mb-3"
          >
            <img
              src={post.profiles?.avatar_url || '/default-avatar.png'}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
              alt={post.profiles?.username}
            />
            <div>
              <p className="font-semibold text-sm text-gray-900">
                {post.profiles?.full_name || post.profiles?.username}
              </p>
              <p className="text-xs text-gray-400">
                @{post.profiles?.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: id })}
              </p>
            </div>
          </Link>

          <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
            {post.content}
          </p>
        </div>

        {post.image_url && (
          <img
            src={post.image_url}
            className="w-full object-cover max-h-[500px]"
            alt="post image"
          />
        )}
      </div>

      {/* Comments */}
      <CommentSection postId={postId} currentUserId={user.id} />
    </div>
  );
}