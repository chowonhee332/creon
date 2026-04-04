import { supabase } from './supabase';

// dataUrl(base64)을 Supabase Storage에 업로드하고 storage_items에 저장
export async function uploadGeneration(
  dataUrl: string,
  fileType: string,
  originalName: string,
  generationId?: string
) {
  console.log('[upload] uploadGeneration 시작');
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  console.log('[upload] user:', user?.id ?? 'null');
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

  console.log('[upload] storage 업로드 시작 path:', path, 'blob size:', blob.size);
  const { error: uploadError } = await supabase.storage
    .from('generations')
    .upload(path, blob, { contentType: fileType, upsert: false });

  console.log('[upload] storage 업로드 결과 error:', uploadError);
  if (uploadError) throw uploadError;

  console.log('[upload] DB insert 시작');
  const { error: dbError } = await supabase.from('storage_items').insert({
    user_id: user.id,
    generation_id: generationId ?? null,
    storage_path: path,
    file_type: fileType,
    file_size: blob.size,
    original_name: originalName,
  });

  console.log('[upload] DB insert 결과 error:', dbError);
  if (dbError) throw dbError;
  return path;
}

// 사용자 생성물 목록 조회
export async function getMyStorageItems() {
  console.log('[storage] getMyStorageItems 시작');
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  console.log('[storage] session user:', user?.id ?? 'null');
  if (!user) return [];

  console.log('[storage] storage_items 쿼리 시작');
  const { data, error } = await supabase
    .from('storage_items')
    .select('*')
    .order('created_at', { ascending: false });

  console.log('[storage] 쿼리 완료 data:', data?.length, 'error:', error);
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
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
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
