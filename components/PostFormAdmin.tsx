'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from './ImageUploader';

export default function PostFormAdmin({ userId, onPost }: { userId: string; onPost: () => void }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;
    setLoading(true);
    const { error } = await supabase.from('posts').insert({
      user_id: userId,
      content: content.trim(),
      image_url: imageUrl || null,
      is_announcement: true
    });
    if (error) alert('Gagal: ' + error.message);
    else {
      setContent('');
      setImageUrl('');
      onPost();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 mb-6">
      <h2 className="font-bold text-blue-700 mb-2">Pengumuman Admin</h2>
      <textarea
        className="w-full border rounded-lg p-2"
        rows={3}
        placeholder="Tulis pengumuman..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <div className="mt-2">
        <ImageUploader onUploadComplete={(url) => setImageUrl(url)} />
        {imageUrl && <img src={imageUrl} className="mt-2 h-20 rounded" alt="preview" />}
      </div>
      <button type="submit" disabled={loading || !content.trim()} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
        {loading ? 'Memposting...' : 'Posting Pengumuman'}
      </button>
    </form>
  );
}