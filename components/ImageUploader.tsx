'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ImageUploader({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file);

    if (error) {
      alert('Upload gagal: ' + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    onUploadComplete(urlData.publicUrl);
    setUploading(false);
  };

  return (
    <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {uploading ? (
        <>
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span>Mengupload...</span>
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>Tambah foto</span>
        </>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
      />
    </label>
  );
}