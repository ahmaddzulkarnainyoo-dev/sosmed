'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PostForm({ userId, userRole }: { userId: string; userRole: string }) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (userRole !== 'admin') return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('posts').insert({
      user_id: userId,
      content: content.trim(),
      is_announcement: true,
    })

    if (error) {
      alert('Gagal posting: ' + error.message)
    } else {
      setContent('')
      alert('Pengumuman berhasil diposting!')
      window.location.reload()
    }
    setIsLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <h2 className="font-bold mb-2 text-blue-700">Buat Pengumuman (Admin)</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Tulis pengumuman untuk organisasi..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Memposting...' : 'Posting Pengumuman'}
          </button>
        </div>
      </form>
    </div>
  )
}