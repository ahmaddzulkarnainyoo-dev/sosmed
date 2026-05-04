// app/actions/sendMessage.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()
  const content = formData.get('content') as string
  const receiverId = formData.get('receiverId') as string

  if (!content?.trim()) {
    return { error: 'Pesan tidak boleh kosong' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Anda harus login' }
  }

  const { error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim(),
    })

  if (error) {
    console.error(error)
    return { error: 'Gagal mengirim pesan' }
  }

  revalidatePath(`/messages/${formData.get('receiverUsername')}`)
  return { success: true }
}