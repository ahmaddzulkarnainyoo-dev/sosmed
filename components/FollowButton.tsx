'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FollowButton({ targetUserId, currentUserId }: { targetUserId: string; currentUserId: string }) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

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
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
      setIsFollowing(false)
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId })
      setIsFollowing(true)
      // Buat notifikasi untuk yang diikuti
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        type: 'follow',
        source_user_id: currentUserId
      })
    }
    setLoading(false)
    window.location.reload() // refresh sementara
  }

  if (!currentUserId) return null
  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-lg ${isFollowing ? 'bg-gray-300 text-gray-700' : 'bg-blue-600 text-white'}`}
    >
      {isFollowing ? 'Berhenti Ikuti' : 'Ikuti'}
    </button>
  )
}