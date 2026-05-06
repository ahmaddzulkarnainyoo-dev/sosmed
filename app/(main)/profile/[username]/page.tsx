import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import FollowButton from '@/components/FollowButton';
import ProfilePosts from '@/components/ProfilePosts';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  // Kalau username === 'me', redirect ke profil sendiri
  if (username === 'me') {
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();
    if (myProfile) redirect(`/profile/${myProfile.username}`);
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio, angkatan, jurusan, role')
    .eq('username', username)
    .single();

  if (error || !profile) notFound();

  // Hitung followers & following
  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
  ]);

  const isOwnProfile = user.id === profile.id;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
        {/* Cover */}
        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600" />

        {/* Avatar + Actions */}
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-10 mb-3">
            <img
              src={profile.avatar_url || '/default-avatar.png'}
              alt={profile.username}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-white"
            />
            <div className="mb-1">
              {isOwnProfile ? (
                <Link
                  href={`/profile/${profile.username}/edit`}
                  className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Edit Profil
                </Link>
              ) : (
                <div className="flex gap-2">
                  <FollowButton targetUserId={profile.id} currentUserId={user.id} />
                  <Link
                    href={`/messages/${profile.username}`}
                    className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Pesan
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="font-bold text-lg text-gray-900">
              {profile.full_name || profile.username}
            </h1>
            <p className="text-sm text-gray-400 mb-2">@{profile.username}</p>

            {profile.bio && (
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">{profile.bio}</p>
            )}

            <div className="flex gap-3 text-xs text-gray-400 mb-3">
              {profile.angkatan && <span>📅 Angkatan {profile.angkatan}</span>}
              {profile.jurusan && <span>📖 {profile.jurusan}</span>}
            </div>

            {/* Stats */}
            <div className="flex gap-5">
              <div className="text-center">
                <p className="font-bold text-gray-900">{followersCount || 0}</p>
                <p className="text-xs text-gray-400">Pengikut</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">{followingCount || 0}</p>
                <p className="text-xs text-gray-400">Mengikuti</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">Postingan</h2>
      <ProfilePosts userId={profile.id} currentUserId={user.id} />
    </div>
  );
}