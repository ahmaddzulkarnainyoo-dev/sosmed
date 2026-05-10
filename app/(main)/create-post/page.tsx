'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';

export default function CreatePostPage() {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/');
      else setUserId(data.user.id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading || !userId) return;
    setLoading(true);
    const { error } = await supabase.from('posts').insert({
      author_id: userId,
      content: content.trim(),
      image_url: imageUrl || null,
      is_announcement: false,
    });
    if (error) alert('Gagal: ' + error.message);
    else {
      router.push('/feed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Buat Postingan</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-4">
        <textarea
          className="w-full p-3 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
          rows={5}
          placeholder="Apa yang sedang kamu pikirkan?"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <div className="mt-3">
          <ImageUploader onUploadComplete={setImageUrl} />
          {imageUrl && (
            <div className="relative mt-2 inline-block">
              <img src={imageUrl} className="h-32 rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="mt-4 w-full bg-blue-600 disabled:bg-blue-300 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          {loading ? 'Memposting...' : 'Posting'}
        </button>
      </form>
    </div>
  );
}