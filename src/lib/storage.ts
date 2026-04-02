import { supabase } from './supabase';

// dataUrl(base64)을 Supabase Storage에 업로드하고 storage_items에 저장
export async function uploadGeneration(
  dataUrl: string,
  fileType: string,
  originalName: string,
  generationId?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  // base64 → Blob 변환
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: fileType });

  const ext = fileType.split('/')[1]?.split(';')[0] || 'bin';
  const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('generations')
    .upload(path, blob, { contentType: fileType, upsert: false });

  if (uploadError) throw uploadError;

  const { error: dbError } = await supabase.from('storage_items').insert({
    user_id: user.id,
    generation_id: generationId ?? null,
    storage_path: path,
    file_type: fileType,
    file_size: blob.size,
    original_name: originalName,
  });

  if (dbError) throw dbError;
  return path;
}

// 사용자 생성물 목록 조회
export async function getMyStorageItems() {
  const { data, error } = await supabase
    .from('storage_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Storage 파일 signed URL 조회 (1시간 유효)
export async function getSignedUrl(path: string) {
  const { data, error } = await supabase.storage
    .from('generations')
    .createSignedUrl(path, 3600);

  if (error) throw error;
  return data.signedUrl;
}

// Blob을 직접 Supabase Storage에 업로드 (비디오용)
export async function uploadBlobGeneration(
  blob: Blob,
  fileType: string,
  originalName: string,
  generationId?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const ext = fileType.split('/')[1]?.split(';')[0] || 'mp4';
  const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('generations')
    .upload(path, blob, { contentType: fileType, upsert: false });

  if (uploadError) throw uploadError;

  const { error: dbError } = await supabase.from('storage_items').insert({
    user_id: user.id,
    generation_id: generationId ?? null,
    storage_path: path,
    file_type: fileType,
    file_size: blob.size,
    original_name: originalName,
  });

  if (dbError) throw dbError;
  return path;
}

// 생성물 삭제
export async function deleteStorageItem(id: string, storagePath: string) {
  await supabase.storage.from('generations').remove([storagePath]);
  await supabase.from('storage_items').delete().eq('id', id);
}
