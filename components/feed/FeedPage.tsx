"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Comment = {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    role: string;
  };
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

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export default function Comments({ postId, currentUserId }: { postId: string; currentUserId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  async function fetchComments() {
    const { data } = await supabase
      .from("comments")
      .select("id, content, created_at, author:profiles!author_id(id, full_name, username, avatar_url, role)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (data) setComments(data as unknown as Comment[]);
    setLoading(false);
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || submitting) return;
    setSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      author_id: currentUserId,
      content: input.trim(),
    });
    if (!error) {
      setInput("");
      await fetchComments();
    }
    setSubmitting(false);
  }

  async function deleteComment(commentId: string) {
    await supabase.from("comments").delete().match({ id: commentId, author_id: currentUserId });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  return (
    <div className="mt-3 pt-3 border-t border-white/8 space-y-3">
      {/* Input */}
      <form onSubmit={submitComment} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis komentar..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || submitting}
          className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          Kirim
        </button>
      </form>

      {/* List */}
      {loading ? (
        <p className="text-xs text-white/30">Memuat komentar...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-white/25 text-center py-2">Belum ada komentar. Jadilah yang pertama.</p>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 group">
              <div className="w-7 h-7 rounded-full bg-violet-500/20 ring-1 ring-violet-500/20 flex items-center justify-center text-[10px] font-semibold text-violet-300 flex-shrink-0 mt-0.5">
                {comment.author.avatar_url ? (
                  <img src={comment.author.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                ) : (
                  initials(comment.author.full_name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-white/5 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-semibold text-white/80">{comment.author.full_name}</span>
                    <span className="text-[10px] text-white/30">{timeAgo(comment.created_at)}</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">{comment.content}</p>
                </div>
              </div>
              {comment.author.id === currentUserId && (
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/20 hover:text-rose-400 self-start mt-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}