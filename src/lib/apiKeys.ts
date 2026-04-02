import { supabase } from './supabase';

export async function saveApiKey(key: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { error } = await supabase
    .from('api_keys')
    .upsert({ user_id: user.id, encrypted_key: key, updated_at: new Date().toISOString() });

  if (error) throw error;
}

export async function getApiKey(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('api_keys')
    .select('encrypted_key')
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return data?.encrypted_key ?? null;
}

export async function deleteApiKey() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}
