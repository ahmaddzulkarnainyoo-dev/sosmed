'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import AvatarUploader from './AvatarUploader';

export default function ProfileForm({ userId, initialData, username }: any) {
  const [formData, setFormData] = useState({
    full_name: initialData.full_name || '',
    bio: initialData.bio || '',
    angkatan: initialData.angkatan || '',
    jurusan: initialData.jurusan || '',
    avatar_url: initialData.avatar_url || '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAvatarUpload = (url: string) => {
    setFormData(prev => ({ ...prev, avatar_url: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        bio: formData.bio,
        angkatan: formData.angkatan,
        jurusan: formData.jurusan,
        avatar_url: formData.avatar_url,
      })
      .eq('id', userId);
    if (error) alert('Gagal: ' + error.message);
    else {
      alert('Profil berhasil diupdate');
      router.push(`/profile/${username}`);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <img src={formData.avatar_url || '/default-avatar.png'} className="w-16 h-16 rounded-full object-cover" />
        <AvatarUploader userId={userId} onUploadComplete={handleAvatarUpload} />
      </div>
      <input name="full_name" placeholder="Nama Lengkap" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full border p-2 rounded" />
      <textarea name="bio" placeholder="Bio" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full border p-2 rounded" />
      <input name="angkatan" placeholder="Angkatan" value={formData.angkatan} onChange={e => setFormData({...formData, angkatan: e.target.value})} className="w-full border p-2 rounded" />
      <input name="jurusan" placeholder="Jurusan" value={formData.jurusan} onChange={e => setFormData({...formData, jurusan: e.target.value})} className="w-full border p-2 rounded" />
      <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 rounded w-full">Simpan</button>
    </form>
  );
}