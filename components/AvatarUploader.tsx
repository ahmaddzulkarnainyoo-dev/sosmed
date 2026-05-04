'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AvatarUploader({ userId, onUploadComplete }: { userId: string; onUploadComplete: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (error) {
      alert('Gagal upload: ' + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    onUploadComplete(urlData.publicUrl);
    setUploading(false);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
      {uploading && <span className="ml-2">Mengupload...</span>}
    </div>
  );
}