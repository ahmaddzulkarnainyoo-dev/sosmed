'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export default function PostCard({ post, currentUserId, onLikeUpdate }) {
  const [liked, setLiked] = useState(post.user_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();

  const handleLike = async () => {
    if (liked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', currentUserId)
        .eq('post_id', post.id);
      if (!error) {
        setLiked(false);
        setLikesCount(prev => prev - 1);
        onLikeUpdate();
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: currentUserId, post_id: post.id });
      if (!error) {
        setLiked(true);
        setLikesCount(prev => prev + 1);
        if (post.profiles.id !== currentUserId) {
          await supabase.from('notifications').insert({
            user_id: post.profiles.id,
            type: 'like',
            source_user_id: currentUserId,
            post_id: post.id,
          });
        }
        onLikeUpdate();
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin hapus postingan ini?')) return;
    setDeleting(true);
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) alert('Gagal hapus');
    else onLikeUpdate();
    setDeleting(false);
  };

  const isOwner = post.profiles.id === currentUserId;
  const canDelete = isOwner || post.profiles.role === 'admin';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header: avatar + nama + menu */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <Link href={`/profile/${post.profiles.username}`} className="flex items-center gap-3">
          <img
            src={post.profiles.avatar_url || '/default-avatar.png'}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-sm">{post.profiles.full_name || post.profiles.username}</p>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: id })}
            </p>
          </div>
        </Link>
        {canDelete && (
          <button onClick={handleDelete} disabled={deleting} className="text-gray-400 hover:text-red-500">
            ⋯
          </button>
        )}
      </div>
      {/* Konten */}
      <div className="px-4 pb-2">
        <p className="text-gray-800 whitespace-pre-wrap text-sm">{post.content}</p>
      </div>
      {/* Gambar */}
      {post.image_url && (
        <img src={post.image_url} className="w-full object-cover max-h-96" />
      )}
      {/* Like & komentar */}
      <div className="px-4 py-2 flex items-center gap-4">
        <button onClick={handleLike} className="flex items-center gap-1">
          {liked ? '❤️' : '🤍'}
          <span className="text-sm">{likesCount}</span>
        </button>
        <Link href={`/post/${post.id}`} className="text-gray-600 text-sm flex items-center gap-1">
          💬 Balas
        </Link>
      </div>
    </div>
  );
}