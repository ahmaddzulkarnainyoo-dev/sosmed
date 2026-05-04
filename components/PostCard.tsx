'use client';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

interface PostCardProps {
  post: any;
  currentUserId: string;
  onLikeUpdate: () => void;
}

export default function PostCard({ post, currentUserId, onLikeUpdate }: PostCardProps) {
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
        setLikesCount((prev: number) => prev - 1);
        onLikeUpdate();
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: currentUserId, post_id: post.id });
      if (!error) {
        setLiked(true);
        setLikesCount((prev: number) => prev + 1);
        // Notifikasi (jika diperlukan)
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
    if (!confirm('Yakin ingin menghapus postingan ini? Tindakan ini tidak bisa dibatalkan.')) return;
    setDeleting(true);
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) {
      alert('Gagal hapus: ' + error.message);
    } else {
      onLikeUpdate(); // refresh feed
    }
    setDeleting(false);
  };

  const isOwner = post.profiles.id === currentUserId;
  const isAdmin = post.profiles.role === 'admin';
  // Bisa hapus jika pemilik ATAU admin (opsional: admin bisa hapus semua)
  const canDelete = isOwner || isAdmin;

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center gap-3 mb-2">
        <Link href={`/profile/${post.profiles.username}`}>
          <img
            src={post.profiles.avatar_url || '/default-avatar.png'}
            alt=""
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
          />
        </Link>
        <div className="flex-1">
          <Link href={`/profile/${post.profiles.username}`} className="font-semibold hover:underline">
            {post.profiles.full_name || post.profiles.username}
          </Link>
          {post.profiles.role === 'admin' && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              Pengurus
            </span>
          )}
          <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
            title="Hapus postingan"
          >
            🗑️
          </button>
        )}
      </div>
      <p className="text-gray-800 whitespace-pre-wrap mb-2">{post.content}</p>
      {post.image_url && (
        <img src={post.image_url} className="mt-2 rounded-lg max-h-96 w-full object-cover" />
      )}
      <div className="flex items-center gap-4 mt-3">
        <button onClick={handleLike} className={`flex items-center gap-1 ${liked ? 'text-red-500' : 'text-gray-500'}`}>
          ❤️ {likesCount}
        </button>
        <Link href={`/post/${post.id}`} className="text-gray-500">
          💬 Balas
        </Link>
      </div>
    </div>
  );
}