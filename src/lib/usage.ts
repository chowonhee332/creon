import { supabase } from './supabase';

export type GenerationType = 'image' | 'video' | 'svg' | 'icon' | 'composition';

export async function logGeneration(type: GenerationType, model?: string, prompt?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('generations').insert({
    user_id: user.id,
    type,
    model: model ?? null,
    prompt: prompt ? prompt.substring(0, 500) : null,
  });
}
