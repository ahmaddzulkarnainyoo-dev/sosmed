'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export default function CommentSection({ postId, currentUserId }: { postId: string; currentUserId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles:user_id (username, full_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel(`comments-${postId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: currentUserId,
      content: newComment.trim(),
    });

    if (error) {
      alert('Gagal: ' + error.message);
    } else {
      setNewComment('');
      fetchComments();
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50">
        <h3 className="font-semibold text-sm text-gray-900">
          Komentar {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 px-4 py-3 border-b border-gray-50">
        <input
          type="text"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Tulis komentar..."
          className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-400 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="bg-blue-600 disabled:bg-blue-300 text-white w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </form>

      {/* Comments list */}
      <div className="divide-y divide-gray-50">
        {loading && (
          <div className="px-4 py-3 space-y-3 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 bg-gray-200 rounded w-24" />
                  <div className="h-2.5 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">
            Belum ada komentar. Jadilah yang pertama!
          </div>
        )}

        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3 px-4 py-3">
            <img
              src={comment.profiles?.avatar_url || '/default-avatar.png'}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              alt={comment.profiles?.username}
            />
            <div className="flex-1 min-w-0">
              <div className="bg-gray-50 rounded-2xl px-3 py-2">
                <Link
                  href={`/profile/${comment.profiles?.username}`}
                  className="font-semibold text-xs text-gray-900 hover:underline"
                >
                  {comment.profiles?.full_name || comment.profiles?.username}
                </Link>
                <p className="text-sm text-gray-800 mt-0.5 leading-relaxed">{comment.content}</p>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 ml-2">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: id })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}