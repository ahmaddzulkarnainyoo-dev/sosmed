'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

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
      .select(`
        *,
        profiles (username, full_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();

    // Subscribe ke komentar baru
    const channel = supabase
      .channel(`comments-${postId}`)
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
    if (!error) {
      setNewComment('');
      // Notifikasi ke pemilik post (jika bukan milik sendiri)
      // TODO: bisa ditambahkan nanti
    } else {
      alert('Gagal kirim komentar');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="p-2 text-gray-400">Memuat komentar...</div>;

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="font-semibold mb-2">Komentar ({comments.length})</h3>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Tulis komentar..."
          className="flex-1 border rounded-full px-4 py-2 text-sm"
        />
        <button type="submit" disabled={submitting || !newComment.trim()} className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm">
          Kirim
        </button>
      </form>
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <img src={comment.profiles?.avatar_url || '/default-avatar.png'} className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <span className="font-semibold text-sm">{comment.profiles?.full_name || comment.profiles?.username}</span>
                <p className="text-sm">{comment.content}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">{new Date(comment.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}