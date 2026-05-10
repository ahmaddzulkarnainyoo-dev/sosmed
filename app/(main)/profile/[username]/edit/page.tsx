'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EditProfilePage() {
  const { username } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    angkatan: '',
    jurusan: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, bio, angkatan, jurusan, avatar_url')
        .eq('username', username)
        .single()

      if (profile) {
        setForm({
          full_name: profile.full_name || '',
          bio: profile.bio || '',
          angkatan: profile.angkatan || '',
          jurusan: profile.jurusan || ''
        })
        setAvatarUrl(profile.avatar_url || '')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [username])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `public/${fileName}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (error) {
      alert('Upload gagal: ' + error.message)
      setUploadingAvatar(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const newUrl = urlData.publicUrl
    setAvatarUrl(newUrl)

    // Langsung update avatar_url di profiles
    await supabase
      .from('profiles')
      .update({ avatar_url: newUrl })
      .eq('username', username)

    setUploadingAvatar(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        bio: form.bio,
        angkatan: form.angkatan,
        jurusan: form.jurusan,
        avatar_url: avatarUrl,
      })
      .eq('username', username)

    if (error) {
      alert('Gagal: ' + error.message)
    } else {
      router.push(`/profile/${username}`)
      router.refresh()
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="max-w-md mx-auto px-4 pt-8 space-y-4 animate-pulse">
      <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto" />
      {[1, 2, 3, 4].map(i => (
        <div key={i}>
          <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-10 bg-gray-100 rounded-xl" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Edit Profil</h1>
      </div>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <img
            src={avatarUrl || '/default-avatar.png'}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-md"
            alt="avatar"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
          >
            {uploadingAvatar ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            )}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
        <p className="text-xs text-gray-400 mt-2">
          {uploadingAvatar ? 'Mengupload...' : 'Ketuk ikon kamera untuk ganti foto'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Nama Lengkap</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nama lengkap kamu"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Ceritakan sedikit tentang dirimu..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Angkatan</label>
            <input
              type="text"
              value={form.angkatan}
              onChange={e => setForm({ ...form, angkatan: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: 2022"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Jurusan</label>
            <input
              type="text"
              value={form.jurusan}
              onChange={e => setForm({ ...form, jurusan: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Teknik Informatika"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || uploadingAvatar}
            className="flex-1 bg-blue-600 disabled:bg-blue-300 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}