// app/messages/page.tsx
import Link from 'next/link'

export default function MessagesPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pesan Langsung</h1>
      <p className="text-gray-500 mb-4">Hubungi alumni & anggota tanpa perlu WhatsApp</p>
      <div className="bg-gray-100 rounded-xl p-8 text-center">
        <p className="text-gray-500 mb-4">Belum ada percakapan.</p>
        <p className="text-gray-500 mb-4">Mulai dengan mencari orang di Direktori.</p>
        <Link href="/directory" className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 inline-block">
          Ke Direktori
        </Link>
      </div>
    </div>
  )
}