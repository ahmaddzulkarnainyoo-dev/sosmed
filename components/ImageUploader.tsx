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

    const { error, data } = await supabase.storage
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
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
      {uploading && <span className="ml-2 text-sm">Mengupload...</span>}
    </div>
  );
}