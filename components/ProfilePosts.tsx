'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PostCard from './PostCard'

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  is_announcement: boolean;
  user_liked: boolean;
  likes_count: number;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    role: string;
  };
}

export default function ProfilePosts({ userId, currentUserId }: { userId: string; currentUserId: string | null }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    const supabase = createClient()

    const [{ data: postsData }, { data: likesData }] = await Promise.all([
      supabase
        .from('posts')
        .select('*, profiles:author_id (id, username, full_name, avatar_url, role)')
        .eq('author_id', userId)
        .order('created_at', { ascending: false }),
      currentUserId
        ? supabase.from('likes').select('post_id').eq('user_id', currentUserId)
        : Promise.resolve({ data: [] })
    ])

    if (!postsData) return

    const likedIds = new Set(likesData?.map(l => l.post_id) || [])
    const postIds = postsData.map(p => p.id)

    const { data: likeCounts } = await supabase
      .from('likes')
      .select('post_id')
      .in('post_id', postIds)

    const countMap: Record<string, number> = {}
    likeCounts?.forEach(({ post_id }) => {
      countMap[post_id] = (countMap[post_id] || 0) + 1
    })

    setPosts(postsData.map(post => ({
      ...post,
      likes_count: countMap[post.id] || 0,
      user_liked: likedIds.has(post.id),
    })))
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [userId])

  if (loading) return (
    <div className="space-y-3">
      {[1, 2].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  )

  if (posts.length === 0) return (
    <div className="text-center py-12 text-gray-400">
      <p className="text-3xl mb-2">📝</p>
      <p className="text-sm">Belum ada postingan.</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId || ''}
          onLikeUpdate={fetchPosts}
        />
      ))}
    </div>
  )
}