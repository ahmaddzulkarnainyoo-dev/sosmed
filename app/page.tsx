import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Himlab Raya</h1>
        <p className="text-gray-600 mb-8">Sosial media komunitas Himlab</p>
        <div className="space-y-3">
          <Link href="/auth" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-center">
            Masuk ke Himlab
          </Link>
          <Link href="/auth?signup=true" className="block w-full bg-white text-blue-600 py-3 rounded-xl font-semibold border border-blue-300 hover:bg-blue-50 transition text-center">
            Daftar Akun
          </Link>
        </div>
      </div>
    </div>
  );
}