'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/feed" className="font-bold text-xl text-blue-600">
            Himlab
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <Link href="/feed" className="hover:text-blue-600">Feed</Link>
            <Link href="/directory" className="hover:text-blue-600">Direktori</Link>
            <Link href="/messages" className="hover:text-blue-600">Pesan</Link>
            <Link href="/notifications" className="hover:text-blue-600">Notifikasi</Link>
            <Link href="/profile/me" className="hover:text-blue-600">Profil</Link>
          </div>

          {/* Tombol Hamburger untuk HP */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-2xl focus:outline-none"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu (dropdown) */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/feed" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>Feed</Link>
            <Link href="/directory" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>Direktori</Link>
            <Link href="/messages" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>Pesan</Link>
            <Link href="/notifications" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>Notifikasi</Link>
            <Link href="/profile/me" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>Profil</Link>
          </div>
        )}
      </div>
    </nav>
  )
}