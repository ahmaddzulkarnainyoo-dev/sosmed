'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function FollowButton({ targetUserId, currentUserId }: { targetUserId: string; currentUserId: string }) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkFollow = async () => {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single()
      setIsFollowing(!!data)
    }
    if (currentUserId) checkFollow()
  }, [targetUserId, currentUserId])

  const handleFollow = async () => {
    setLoading(true)
    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
      setIsFollowing(false)
    } else {
      await supabase.from('follows').insert({
        follower_id: currentUserId,
        following_id: targetUserId
      })
      setIsFollowing(true)
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        type: 'follow',
        source_user_id: currentUserId
      })
    }
    setLoading(false)
    router.refresh()
  }

  if (!currentUserId) return null

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        isFollowing
          ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {loading ? '...' : isFollowing ? 'Mengikuti' : 'Ikuti'}
    </button>
  )
}