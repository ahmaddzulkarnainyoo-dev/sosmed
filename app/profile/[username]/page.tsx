import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import FollowButton from '@/components/FollowButton'
import ProfilePosts from '@/components/ProfilePosts'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, posts_count, followers_count, following_count')
    .eq('username', username)
    .single()
  if (error || !profile) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  let isOwnProfile = false
  let currentUserProfile = null
  if (user) {
    const { data: cur } = await supabase.from('profiles').select('id').eq('id', user.id).single()
    isOwnProfile = cur?.id === profile.id
    if (!isOwnProfile) {
      currentUserProfile = cur
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow p-6 text-center">
        <img src={profile.avatar_url || '/default-avatar.png'} className="w-24 h-24 rounded-full mx-auto object-cover" />
        <h1 className="text-2xl font-bold mt-2">{profile.full_name || profile.username}</h1>
        <p className="text-gray-500">@{profile.username}</p>
        {profile.role === 'admin' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Pengurus</span>}
        <p className="mt-2">{profile.bio || 'Belum ada bio.'}</p>
        <div className="flex justify-center gap-4 mt-3 text-sm">
          <span><strong>{profile.posts_count}</strong> posting</span>
          <span><strong>{profile.followers_count}</strong> pengikut</span>
          <span><strong>{profile.following_count}</strong> mengikuti</span>
        </div>
        {user && !isOwnProfile && (
          <div className="mt-4">
            <FollowButton targetUserId={profile.id} currentUserId={currentUserProfile?.id} />
          </div>
        )}
        {isOwnProfile && (
          <Link href={`/profile/${username}/edit`} className="inline-block mt-4 bg-gray-200 px-4 py-2 rounded-lg">Edit Profil</Link>
        )}
      </div>
      <div className="mt-6">
        <h2 className="font-bold text-lg mb-2">Postingan {profile.full_name || profile.username}</h2>
        <ProfilePosts userId={profile.id} currentUserId={user?.id || null} />
      </div>
    </div>
  )
}