'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ProfilePosts({ userId, currentUserId }: { userId: string; currentUserId: string | null }) {
  const [posts, setPosts] = useState<any[]>([])
  useEffect(() => {
    const fetchPosts = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('posts')
        .select('*, profiles!inner(id, username, full_name, avatar_url, role)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (data) setPosts(data)
    }
    fetchPosts()
  }, [userId])
  if (posts.length === 0) return <p className="text-gray-500">Belum ada postingan.</p>
  return (
    <div className="space-y-4">
      {posts.map(post => (
        <div key={post.id} className="bg-white rounded-xl shadow p-4">
          <p>{post.content}</p>
          <Link href={`/post/${post.id}`} className="text-sm text-blue-500">Lihat detail</Link>
        </div>
      ))}
    </div>
  )
}