// app/profile/[username]/edit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EditProfilePage() {
  const { username } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    angkatan: '',
    jurusan: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, bio, angkatan, jurusan')
        .eq('username', username)
        .single()

      if (profile) {
        setForm({
          full_name: profile.full_name || '',
          bio: profile.bio || '',
          angkatan: profile.angkatan || '',
          jurusan: profile.jurusan || ''
        })
      }
      setLoading(false)
    }
    fetchProfile()
  }, [username, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        bio: form.bio,
        angkatan: form.angkatan,
        jurusan: form.jurusan
      })
      .eq('username', username)

    if (error) {
      alert('Gagal update: ' + error.message)
    } else {
      alert('Profil berhasil diupdate!')
      router.push(`/profile/${username}`)
    }
    setSaving(false)
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Profil</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Angkatan</label>
          <input
            type="text"
            value={form.angkatan}
            onChange={(e) => setForm({ ...form, angkatan: e.target.value })}
            placeholder="Contoh: 2022"
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Jurusan</label>
          <input
            type="text"
            value={form.jurusan}
            onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
            placeholder="Contoh: Teknik Informatika"
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-300 px-4 py-2 rounded-lg"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}