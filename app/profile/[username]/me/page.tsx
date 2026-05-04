import { createClient } from '@/lib/supabase/server';
import ProfileForm from '../ProfileForm';

export default async function MyProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-4">Silakan login</div>;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return <div>Profil tidak ditemukan</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Profil</h1>
      <ProfileForm
        userId={user.id}
        initialData={{
          full_name: profile.full_name,
          bio: profile.bio,
          angkatan: profile.angkatan,
          jurusan: profile.jurusan,
          avatar_url: profile.avatar_url,
        }}
        username={profile.username}
      />
    </div>
  );
}