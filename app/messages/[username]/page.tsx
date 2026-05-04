// app/messages/[username]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ChatDetailPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params  // ← penting: await params
  
  const supabase = await createClient()
  
  // Ambil data user yang dituju berdasarkan username
  const { data: receiver, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .eq('username', username)
    .single()

  if (error || !receiver) notFound()

  // Ambil user yang sedang login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div className="p-4">Silakan login terlebih dahulu</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold">Chat dengan {receiver.full_name || receiver.username}</h1>
      <p className="text-sm text-gray-500">@{receiver.username}</p>
      <p className="mt-4">ID receiver: {receiver.id}</p>
      <p>ID current user: {user.id}</p>
    </div>
  )
}