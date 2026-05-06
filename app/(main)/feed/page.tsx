import { createClient } from '@/lib/supabase/server';
import FeedWithFollow from '@/components/FeedWithFollow';
import { redirect } from 'next/navigation';

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      <FeedWithFollow
        currentUserId={user.id}
        userRole={profile?.role || 'member'}
      />
    </div>
  );
}