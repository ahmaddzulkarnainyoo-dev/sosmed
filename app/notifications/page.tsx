import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type NotificationItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  timestamp: string;
  type: "announcement" | "message" | "like" | "comment";
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}j`;
  return `${Math.floor(hrs / 24)}h`;
}

function Badge({ type }: { type: NotificationItem["type"] }) {
  const map = {
    announcement: "bg-amber-500/10 text-amber-300",
    message: "bg-violet-500/10 text-violet-300",
    like: "bg-rose-500/10 text-rose-300",
    comment: "bg-sky-500/10 text-sky-300",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium ${map[type]}`}>{type}</span>;
}

function normalizeProfile(data: any) {
  if (!data) return { username: "anonymous" };
  return Array.isArray(data) ? data[0] : data;
}

export default async function NotificationsPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) redirect("/");

  const [{ data: announcements }, { data: messages }, { data: userPosts }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, content, created_at, author:profiles!author_id(full_name, username)")
      .eq("type", "announcement")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("direct_messages")
      .select("id, content, created_at, is_read, sender:profiles!sender_id(full_name, username)")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("posts")
      .select("id")
      .eq("author_id", user.id),
  ]);

  const postIds = (userPosts || []).map((post) => post.id);

  const [likesResponse, commentsResponse] = postIds.length
    ? await Promise.all([
        supabase
          .from("likes")
          .select("id, created_at, post:posts!post_id(id, content), user:profiles!user_id(full_name, username)")
          .in("post_id", postIds)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("comments")
          .select("id, created_at, content, post:posts!post_id(id, content), user:profiles!user_id(full_name, username)")
          .in("post_id", postIds)
          .order("created_at", { ascending: false })
          .limit(5),
      ])
    : [{ data: [] }, { data: [] }];

  const likes = likesResponse?.data || [];
  const comments = commentsResponse?.data || [];

  const notificationItems: NotificationItem[] = [];

  if (announcements) {
    notificationItems.push(
      ...announcements.map((item) => {
        const author = normalizeProfile(item.author);
        return {
          id: item.id,
          title: "Pengumuman organisasi",
          subtitle: `Dari @${author.username}`,
          description: item.content,
          timestamp: item.created_at,
          type: "announcement" as const,
        };
      })
    );
  }

  if (messages) {
    notificationItems.push(
      ...messages.map((item) => {
        const sender = normalizeProfile(item.sender);
        return {
          id: item.id,
          title: "Pesan masuk",
          subtitle: `Dari @${sender.username}`,
          description: item.content,
          timestamp: item.created_at,
          type: "message" as const,
        };
      })
    );
  }

  if (likes.length > 0) {
    notificationItems.push(
      ...likes.map((item) => {
        const userProfile = normalizeProfile(item.user);
        const likedPost = Array.isArray(item.post) ? item.post[0] : item.post;
        return {
          id: item.id,
          title: "Suka baru",
          subtitle: `@${userProfile.username} menyukai postinganmu`,
          description: likedPost?.content ?? "",
          timestamp: item.created_at,
          type: "like" as const,
        };
      })
    );
  }

  if (comments.length > 0) {
    notificationItems.push(
      ...comments.map((item) => {
        const userProfile = normalizeProfile(item.user);
        const commentedPost = Array.isArray(item.post) ? item.post[0] : item.post;
        return {
          id: item.id,
          title: "Komentar baru",
          subtitle: `@${userProfile.username} mengomentari postinganmu`,
          description: item.content || commentedPost?.content || "",
          timestamp: item.created_at,
          type: "comment" as const,
        };
      })
    );
  }

  const sortedItems = notificationItems.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="relative max-w-xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/feed" className="text-xs text-white/30 hover:text-white/60 inline-flex items-center gap-1.5 mb-3">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Kembali ke Feed
          </Link>
          <h1 className="text-2xl font-bold text-white/95">Notifikasi</h1>
          <p className="text-sm text-white/40 mt-1">Semua notifikasi penting untuk anggota organisasi.</p>
        </div>

        <div className="space-y-4">
          {sortedItems.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white/40">
              <p className="text-sm">Belum ada notifikasi baru.</p>
              <p className="text-xs mt-2">Aktifkan interaksi dan pengumuman untuk melihat update di sini.</p>
            </div>
          ) : (
            sortedItems.map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white/90">{item.title}</p>
                    <p className="text-xs text-white/40 mt-1">{item.subtitle}</p>
                  </div>
                  <Badge type={item.type} />
                </div>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">{item.description}</p>
                <p className="text-[11px] text-white/30 mt-3">{timeAgo(item.timestamp)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
