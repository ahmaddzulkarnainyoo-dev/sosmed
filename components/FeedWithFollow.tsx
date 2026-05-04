'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PostCard from './PostCard';
import PostFormAdmin from './PostFormAdmin';

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  is_announcement: boolean;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    role: string;
  };
  likes_count?: number;
  user_liked?: boolean;
}

export default function FeedAllPosts({ currentUserId, userRole }: { currentUserId: string; userRole: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchFeed = async () => {
    setLoading(true);

    // Ambil semua postingan (tanpa filter follow)
    const { data: postsData, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (id, username, full_name, avatar_url, role)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setPosts([]);
      setLoading(false);
      return;
    }

    // Ambil like user saat ini untuk setiap post
    const { data: likesData } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', currentUserId);
    const likedPostIds = new Set(likesData?.map((l) => l.post_id) || []);

    // Hitung jumlah like per post
    const postsWithCounts = await Promise.all(
      (postsData || []).map(async (post) => {
        const { count } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        return {
          ...post,
          likes_count: count || 0,
          user_liked: likedPostIds.has(post.id),
        };
      })
    );
    setPosts(postsWithCounts);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeed();
  }, [currentUserId]);

  if (loading) return <div className="p-4">Memuat feed...</div>;

  return (
    <div>
      {userRole === 'admin' && <PostFormAdmin userId={currentUserId} onPost={fetchFeed} />}
      {posts.length === 0 && (
        <p className="text-gray-500 text-center p-4">
          Belum ada postingan. Admin bisa membuat pengumuman, anggota bisa posting nanti.
        </p>
      )}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={currentUserId} onLikeUpdate={fetchFeed} />
        ))}
      </div>
    </div>
  );
}