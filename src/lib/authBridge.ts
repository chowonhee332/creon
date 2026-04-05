// index.html 인라인 스크립트에서 Supabase Auth를 사용할 수 있도록 window에 노출
import { supabase } from './supabase';
import { saveApiKey, getApiKey, deleteApiKey } from './apiKeys';

const authBridge = {
  async signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase client is not initialized.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string) {
    if (!supabase) throw new Error('Supabase client is not initialized.');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, email, status: 'pending' }, { onConflict: 'id' });
    }
    return data;
  },

  async signOut() {
    if (!supabase) throw new Error('Supabase client is not initialized.');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async getProfile() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return data;
  },

  async saveApiKey(key: string) {
    return saveApiKey(key);
  },

  async getApiKey() {
    return getApiKey();
  },

  async deleteApiKey() {
    return deleteApiKey();
  },

  onAuthStateChange(callback: (session: any, event: string) => void) {
    if (!supabase) return () => {};
    const { data } = supabase.auth.onAuthStateChange((event, session) => callback(session, event));
    return data.subscription.unsubscribe;
  },

  openModal(tab: 'login' | 'signup' = 'login') {
    const overlay = document.getElementById('login-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    if (tab === 'signup') {
      (document.getElementById('auth-tab-signup') as HTMLButtonElement)?.click();
    } else {
      (document.getElementById('auth-tab-login') as HTMLButtonElement)?.click();
    }
  },
};

(window as any).creonAuth = authBridge;

export default authBridge;
