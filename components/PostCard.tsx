'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

type PostCardProps = {
  post: {
    id: string;
    content: string;
    image_url?: string | null;
    created_at: string;
    likes_count: number;
    user_liked: boolean;
    is_announcement?: boolean;
    profiles: {
      id: string;
      username: string;
      full_name?: string | null;
      avatar_url?: string | null;
      role?: string | null;
    };
  };
  currentUserId: string;
  userRole?: string;
  onLikeUpdate: () => void;
};

export default function PostCard({ post, currentUserId, userRole, onLikeUpdate }: PostCardProps) {
  const [liked, setLiked] = useState(post.user_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const isOwner = post.profiles.id === currentUserId;
  const canDelete = isOwner || userRole === 'admin';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

    if (newLiked) {
      await supabase.from('likes').insert({ user_id: currentUserId, post_id: post.id });
      if (post.profiles.id !== currentUserId) {
        await supabase.from('notifications').insert({
          user_id: post.profiles.id,
          type: 'like',
          source_user_id: currentUserId,
          post_id: post.id,
        });
      }
    } else {
      await supabase.from('likes').delete()
        .eq('user_id', currentUserId)
        .eq('post_id', post.id);
    }
    onLikeUpdate();
  };

  const handleDelete = async () => {
    if (!confirm('Yakin hapus postingan ini?')) return;
    setDeleting(true);
    setMenuOpen(false);
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) alert('Gagal hapus');
    else onLikeUpdate();
    setDeleting(false);
  };

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${
      post.is_announcement ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
    }`}>
      {post.is_announcement && (
        <div className="px-4 pt-2.5 pb-0">
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
            📢 Pengumuman
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <Link href={`/profile/${post.profiles.username}`} className="flex items-center gap-3 min-w-0">
          <img
            src={post.profiles.avatar_url || '/default-avatar.png'}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
            alt={post.profiles.username}
          />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {post.profiles.full_name || post.profiles.username}
            </p>
            <p className="text-xs text-gray-400">
              @{post.profiles.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: id })}
            </p>
          </div>
        </Link>

        {canDelete && (
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  {deleting ? 'Menghapus...' : 'Hapus postingan'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Konten */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
      </div>

      {/* Gambar */}
      {post.image_url && (
        <img
          src={post.image_url}
          className="w-full object-cover max-h-[500px]"
          alt="post image"
        />
      )}

      {/* Actions */}
      <div className="px-4 py-2.5 flex items-center gap-5 border-t border-gray-50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all active:scale-90 ${
            liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          }`}
        >
          <svg
            width="18" height="18"
            viewBox="0 0 24 24"
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            className="transition-all"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>{likesCount > 0 ? likesCount : ''}</span>
        </button>

        <Link
          href={`/post/${post.id}`}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-500 font-medium transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Komentar</span>
        </Link>
      </div>
    </div>
  );
}