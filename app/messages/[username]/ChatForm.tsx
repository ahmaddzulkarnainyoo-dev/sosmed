'use client'

import { useState } from 'react'

export default function ChatForm({ receiverId, currentUserId }: { receiverId: string, currentUserId: string }) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isSending) return

    setIsSending(true)
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: receiverId,
          content: message
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal mengirim pesan')
      }

      setMessage('')
    } catch (error) {
      console.error(error)
      alert('Gagal mengirim pesan. Coba lagi.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tulis pesan..."
        disabled={isSending}
        className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      />
      <button 
        type="submit" 
        disabled={isSending || !message.trim()}
        className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 disabled:opacity-50"
      >
        {isSending ? 'Mengirim...' : 'Kirim'}
      </button>
    </form>
  )
}