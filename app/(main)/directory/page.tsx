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
    setFilteredMembers(
      allMembers.filter(m =>
        (m.full_name?.toLowerCase() || '').includes(q) ||
        (m.username?.toLowerCase() || '').includes(q) ||
        (m.angkatan?.toLowerCase() || '').includes(q) ||
        (m.jurusan?.toLowerCase() || '').includes(q)
      )
    )
  }, [search, allMembers])

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      <h1 className="text-xl font-bold mb-4 text-gray-900">Direktori Anggota</h1>

      <input
        type="text"
        placeholder="Cari nama, username, angkatan, jurusan..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />

      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-xl animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-32" />
                <div className="h-2.5 bg-gray-100 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredMembers.length === 0 && (
        <p className="text-center text-gray-400 py-10 text-sm">Tidak ada anggota yang cocok.</p>
      )}

      <div className="space-y-2">
        {filteredMembers.map(user => (
          <Link
            key={user.id}
            href={`/profile/${user.username}`}
            className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all"
          >
            <img
              src={user.avatar_url || '/default-avatar.png'}
              alt={user.username}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {user.full_name || user.username}
              </p>
              <p className="text-xs text-gray-400">@{user.username}</p>
              {(user.angkatan || user.jurusan) && (
                <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                  {user.angkatan && <span>{user.angkatan}</span>}
                  {user.jurusan && <span>· {user.jurusan}</span>}
                </div>
              )}
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 flex-shrink-0">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}