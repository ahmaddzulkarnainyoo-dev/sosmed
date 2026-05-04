'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update(formData)
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
      <input name="full_name" placeholder="Nama Lengkap" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full border p-2 rounded" />
      <textarea name="bio" placeholder="Bio" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full border p-2 rounded" />
      <input name="angkatan" placeholder="Angkatan" value={formData.angkatan} onChange={e => setFormData({...formData, angkatan: e.target.value})} className="w-full border p-2 rounded" />
      <input name="jurusan" placeholder="Jurusan" value={formData.jurusan} onChange={e => setFormData({...formData, jurusan: e.target.value})} className="w-full border p-2 rounded" />
      <input name="avatar_url" placeholder="URL Avatar" value={formData.avatar_url} onChange={e => setFormData({...formData, avatar_url: e.target.value})} className="w-full border p-2 rounded" />
      <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 rounded w-full">Simpan</button>
    </form>
  );
}