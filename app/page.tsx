import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Himlab Raya
        </h1>
        <p className="text-gray-600 mb-8">Sosial media komunitas Himlab</p>
        <div className="space-y-3">
          <Link href="/auth" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
            Masuk ke Himlab
          </Link>
          <Link href="/auth?signup=true" className="block w-full bg-white text-blue-600 py-3 rounded-xl font-semibold border border-blue-600 hover:bg-blue-50 transition">
            Daftar Akun
          </Link>
        </div>
      </div>
    </div>
  );
}