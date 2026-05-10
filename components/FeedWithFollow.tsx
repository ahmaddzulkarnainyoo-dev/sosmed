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
  user_liked: boolean;
}

function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-gray-200 rounded w-32" />
          <div className="h-2.5 bg-gray-100 rounded w-20" />
        </div>
      </div>
      <div className="px-4 pb-3 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
      </div>
      <div className="px-4 py-2.5 border-t border-gray-50 flex gap-5">
        <div className="h-4 w-12 bg-gray-100 rounded" />
        <div className="h-4 w-20 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default function FeedWithFollow({
  currentUserId,
  userRole,
}: {
  currentUserId: string;
  userRole: string;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const loadingRef = useRef(false);
  const supabase = createClient();
  const { ref, inView } = useInView({ threshold: 0.1 });

  const fetchPosts = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      const currentPage = reset ? 0 : page;
      const from = currentPage * pageSize;
      const to = from + pageSize - 1;

      const [{ data: postsData, error }, { data: likesData }] = await Promise.all([
        supabase
          .from('posts')
          .select('*, profiles:author_id (id, username, full_name, avatar_url, role)')
          .order('is_announcement', { ascending: false })
          .order('created_at', { ascending: false })
          .range(from, to),
        supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', currentUserId),
      ]);

      if (error) {
        console.error(error);
        loadingRef.current = false;
        return;
      }

      const likedPostIds = new Set(likesData?.map((l) => l.post_id) || []);

      // Fetch semua like counts sekaligus lewat RPC atau aggregasi
      const postIds = (postsData || []).map((p) => p.id);
      const { data: likeCounts } = await supabase
        .from('likes')
        .select('post_id')
        .in('post_id', postIds);

      const countMap: Record<string, number> = {};
      likeCounts?.forEach(({ post_id }) => {
        countMap[post_id] = (countMap[post_id] || 0) + 1;
      });

      const postsWithCounts: Post[] = (postsData || []).map((post) => ({
        ...post,
        likes_count: countMap[post.id] || 0,
        user_liked: likedPostIds.has(post.id),
      }));

      if (reset) {
        setPosts(postsWithCounts);
        setPage(1);
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPosts = postsWithCounts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
        setPage((prev) => prev + 1);
      }

      setHasMore((postsData?.length || 0) === pageSize);
      loadingRef.current = false;
      setLoading(false);
    },
    [page, currentUserId]
  );

  useEffect(() => {
    fetchPosts(true);
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loadingRef.current && !loading) {
      fetchPosts();
    }
  }, [inView, hasMore, loading]);

  return (
    <div className="space-y-3">
      {userRole === 'admin' && (
        <PostFormAdmin userId={currentUserId} onPost={() => fetchPosts(true)} />
      )}

      {loading && posts.length === 0 ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">Belum ada postingan.</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            userRole={userRole}
            onLikeUpdate={() => {}}
          />
        ))
      )}

      {hasMore && (
        <div ref={ref} className="py-6 text-center">
          <div className="inline-flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="py-6 text-center text-gray-300 text-xs">— Sudah semua —</p>
      )}
    </div>
  );
}