import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !profile) notFound();

  // Ambil postingan user
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow p-6 text-center">
        <img src={profile.avatar_url || '/default-avatar.png'} className="w-24 h-24 rounded-full mx-auto object-cover" />
        <h1 className="text-2xl font-bold mt-2">{profile.full_name || profile.username}</h1>
        <p className="text-gray-500">@{profile.username}</p>
        <p className="mt-2">{profile.bio || 'Belum ada bio.'}</p>
        <div className="flex justify-center gap-4 mt-3 text-sm">
          <span><strong>{posts?.length || 0}</strong> posting</span>
        </div>
        <Link href={`/messages/${username}`} className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
          Kirim Pesan
        </Link>
      </div>
    </div>
  );
}