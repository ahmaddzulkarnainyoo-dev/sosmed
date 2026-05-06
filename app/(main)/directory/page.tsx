// app/directory/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url: string
  angkatan: string
  jurusan: string
}

export default function DirectoryPage() {
  const [allMembers, setAllMembers] = useState<Profile[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, angkatan, jurusan')
        .order('full_name')

      if (!error && data) {
        setAllMembers(data)
        setFilteredMembers(data)
      }
      setLoading(false)
    }
    fetchMembers()
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    const filtered = allMembers.filter(member =>
      (member.full_name?.toLowerCase() || '').includes(q) ||
      (member.username?.toLowerCase() || '').includes(q) ||
      (member.angkatan?.toLowerCase() || '').includes(q) ||
      (member.jurusan?.toLowerCase() || '').includes(q)
    )
    setFilteredMembers(filtered)
  }, [search, allMembers])

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Direktori Anggota</h1>
      
      {/* Input Pencarian */}
      <input
        type="text"
        placeholder="Cari nama, username, angkatan, atau jurusan..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-xl px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading && <p className="text-gray-500">Memuat anggota...</p>}

      {!loading && filteredMembers.length === 0 && (
        <p className="text-gray-500">Tidak ada anggota yang cocok.</p>
      )}

      <div className="space-y-3">
        {filteredMembers.map((user) => (
          <Link
            key={user.id}
            href={`/messages/${user.username}`}
            className="flex items-center gap-4 p-3 bg-white rounded-xl shadow hover:shadow-md transition"
          >
            <img
              src={user.avatar_url || '/default-avatar.png'}
              alt={user.full_name || user.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold">{user.full_name || user.username}</p>
              <p className="text-sm text-gray-500">@{user.username}</p>
              <div className="flex gap-3 text-xs text-gray-400 mt-1">
                {user.angkatan && <span>📅 {user.angkatan}</span>}
                {user.jurusan && <span>📖 {user.jurusan}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}