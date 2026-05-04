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
      if (!data.user) router.push('/auth');
      else setUserId(data.user.id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading || !userId) return;
    setLoading(true);
    const { error } = await supabase.from('posts').insert({
      user_id: userId,
      content: content.trim(),
      image_url: imageUrl || null,
      is_announcement: false, // postingan biasa (bukan pengumuman)
    });
    if (error) alert('Gagal: ' + error.message);
    else {
      setContent('');
      setImageUrl('');
      router.push('/feed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">Buat Postingan Baru</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4">
        <textarea
          className="w-full border rounded-lg p-3"
          rows={5}
          placeholder="Apa yang sedang kamu pikirkan?"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <div className="mt-3">
          <ImageUploader onUploadComplete={setImageUrl} />
          {imageUrl && <img src={imageUrl} className="mt-2 h-32 rounded object-cover" />}
        </div>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold"
        >
          {loading ? 'Memposting...' : 'Posting'}
        </button>
      </form>
    </div>
  );
}