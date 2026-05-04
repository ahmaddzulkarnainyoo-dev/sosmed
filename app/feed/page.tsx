import { createClient } from '@/lib/supabase/server';
import FeedWithFollow from '@/components/FeedWithFollow'; // atau nama komponen Anda

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-4">Silakan login</div>;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  const userRole = profile?.role || 'member';

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">Feed Organisasi</h1>
      <FeedWithFollow currentUserId={user.id} userRole={userRole} />
    </div>
  );
}