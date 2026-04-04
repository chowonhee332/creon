import { supabase } from './supabase';

const checkSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please check your environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).');
  }
  return supabase;
};

export async function signUp(email: string, password: string) {
  const s = checkSupabase();
  const { data, error } = await s.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const s = checkSupabase();
  const { data, error } = await s.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const s = checkSupabase();
  const { error } = await s.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const s = checkSupabase();
  const { data: { session } } = await s.auth.getSession();
  return session;
}

export async function getProfile() {
  const s = checkSupabase();
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await s
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) throw error;
  return data;
}

export function onAuthStateChange(callback: (session: any) => void) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription.unsubscribe;
}
