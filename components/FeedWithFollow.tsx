'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import PostCard from './PostCard';
import PostFormAdmin from './PostFormAdmin';
import { useInView } from 'react-intersection-observer';

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
  likes_count: number;
  user_liked: boolean;   // ← wajib boolean, tidak optional
}

export default function FeedWithFollow({ currentUserId, userRole }: { currentUserId: string; userRole: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const loadingRef = useRef(false);
  const supabase = createClient();
  const { ref, inView } = useInView();

  const fetchPosts = useCallback(async (reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const currentPage = reset ? 0 : page;
    const from = currentPage * pageSize;
    const to = from + pageSize - 1;

    const { data: postsData, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (id, username, full_name, avatar_url, role)
      `)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error(error);
      loadingRef.current = false;
      return;
    }

    // Ambil likes user saat ini
    const { data: likesData } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', currentUserId);
    const likedPostIds = new Set(likesData?.map((l) => l.post_id) || []);

    // Hitung jumlah like per post
    const postsWithCounts: Post[] = await Promise.all(
      (postsData || []).map(async (post) => {
        const { count } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        return {
          ...post,
          likes_count: count || 0,
          user_liked: likedPostIds.has(post.id), // selalu boolean
        };
      })
    );

    if (reset) {
      setPosts(postsWithCounts);
      setPage(1);
    } else {
      setPosts((prev) => [...prev, ...postsWithCounts]);
      setPage((prev) => prev + 1);
    }

    setHasMore(postsData?.length === pageSize);
    loadingRef.current = false;
    setLoading(false);
  }, [page, pageSize, currentUserId]);

  useEffect(() => {
    fetchPosts(true);
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loadingRef.current && !loading) {
      fetchPosts();
    }
  }, [inView, hasMore, loading]);

  if (loading && posts.length === 0) return <div className="p-4 text-center">Memuat feed...</div>;

  return (
    <div>
      {userRole === 'admin' && <PostFormAdmin userId={currentUserId} onPost={() => fetchPosts(true)} />}
      {posts.length === 0 && (
        <p className="text-gray-500 text-center p-4">
          Belum ada postingan. Admin bisa membuat pengumuman, anggota bisa posting nanti.
        </p>
      )}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={currentUserId} onLikeUpdate={() => fetchPosts(true)} />
        ))}
      </div>
      {hasMore && (
        <div ref={ref} className="py-4 text-center text-gray-400 text-sm">
          Memuat lebih banyak...
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <div className="py-4 text-center text-gray-400 text-sm">
          ✨ Sudah sampai bawah ✨
        </div>
      )}
    </div>
  );
}