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
      .select('*, profiles(username, full_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();

    // Subscribe ke komentar baru (realtime)
    const channel = supabase
      .channel(`comments:${postId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, (payload) => {
        setComments((prev) => [...prev, payload.new as Comment]);
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
      alert('Gagal mengirim komentar: ' + error.message);
    } else {
      setNewComment('');
      // Refresh untuk dapat data terbaru (termasuk profil)
      fetchComments();
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="font-semibold text-gray-700 mb-2">Komentar ({comments.length})</h3>
      
      {/* Form komentar */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Tulis komentar..."
          className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-50"
        >
          Kirim
        </button>
      </form>

      {/* Daftar komentar */}
      {loading && <p className="text-gray-400 text-sm">Memuat...</p>}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <img
              src={comment.profiles?.avatar_url || '/default-avatar.png'}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="bg-gray-100 rounded-xl px-3 py-2">
                <Link href={`/profile/${comment.profiles?.username}`} className="font-semibold text-sm hover:underline">
                  {comment.profiles?.full_name || comment.profiles?.username}
                </Link>
                <p className="text-gray-800 text-sm">{comment.content}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: id })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}