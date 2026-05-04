import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function MyProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  if (profile?.username) {
    redirect(`/profile/${profile.username}`);
  } else {
    redirect('/directory');
  }
}