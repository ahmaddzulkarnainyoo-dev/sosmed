import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import FollowButton from '@/components/FollowButton';
import ProfilePosts from '@/components/ProfilePosts';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, posts_count, followers_count, following_count')
    .eq('username', username)
    .single();

  if (error || !profile) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  let currentUserId = null;
  let isOwnProfile = false;
  if (user) {
    const { data: currentUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    currentUserId = currentUser?.id;
    isOwnProfile = currentUserId === profile.id;
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-b-2xl"></div>
      <div className="px-4">
        <div className="relative -mt-12 mb-4">
          <img
            src={profile.avatar_url || '/default-avatar.png'}
            className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
            alt=""
          />
        </div>
        <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
        <p className="text-gray-500 text-sm">@{profile.username}</p>
        {profile.bio && <p className="mt-2 text-gray-700">{profile.bio}</p>}
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
          {profile.angkatan && <span>🎓 Angkatan {profile.angkatan}</span>}
          {profile.jurusan && <span>📖 {profile.jurusan}</span>}
        </div>
        <div className="flex gap-6 mt-4 text-center">
          <div><span className="font-bold">{profile.posts_count || 0}</span> <span className="text-gray-500">posting</span></div>
          <div><span className="font-bold">{profile.followers_count || 0}</span> <span className="text-gray-500">pengikut</span></div>
          <div><span className="font-bold">{profile.following_count || 0}</span> <span className="text-gray-500">mengikuti</span></div>
        </div>
        <div className="flex gap-3 mt-4">
          {isOwnProfile ? (
            <Link href={`/profile/${username}/edit`} className="flex-1 bg-gray-100 text-center py-2 rounded-lg font-semibold hover:bg-gray-200">Edit Profil</Link>
          ) : (
            currentUserId && (
              <>
                <FollowButton targetUserId={profile.id} currentUserId={currentUserId} />
                <Link href={`/messages/${username}`} className="flex-1 bg-blue-500 text-white text-center py-2 rounded-lg font-semibold hover:bg-blue-600">Kirim Pesan</Link>
              </>
            )
          )}
        </div>
      </div>
      <div className="mt-6 px-4">
        <h2 className="font-semibold text-lg mb-3">Postingan</h2>
        <ProfilePosts userId={profile.id} currentUserId={currentUserId} />
      </div>
    </div>
  );
}