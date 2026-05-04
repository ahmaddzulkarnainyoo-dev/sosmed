'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchNotifs = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('notifications')
        .select('*, profiles!source_user_id (username, full_name, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setNotifs(data || [])
      // Mark as read
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
    }
    fetchNotifs()
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notifikasi</h1>
      {notifs.length === 0 && <p className="text-gray-500">Belum ada notifikasi.</p>}
      <div className="space-y-2">
        {notifs.map(notif => (
          <div key={notif.id} className="bg-white p-3 rounded-xl shadow">
            <div className="flex items-center gap-2">
              <img src={notif.profiles?.avatar_url || '/default-avatar.png'} className="w-8 h-8 rounded-full" />
              <div>
                <Link href={`/profile/${notif.profiles?.username}`} className="font-semibold">
                  {notif.profiles?.full_name || notif.profiles?.username}
                </Link>
                {notif.type === 'like' && <span> menyukai postinganmu.</span>}
                {notif.type === 'follow' && <span> mengikutimu.</span>}
                <p className="text-xs text-gray-400">{new Date(notif.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}