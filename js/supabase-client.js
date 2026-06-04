// Supabase 클라이언트 공유 모듈
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://smqekqdlkkqagzrvtnmh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtcWVrcWRsa2txYWd6cnZ0bm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDkzODcsImV4cCI6MjA5NjE4NTM4N30.VomC09MBc9vEs9A-vZIiwM_LAoUrODXRZHFAX0CEvjc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 현재 로그인 세션 반환
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// 구독 상태 확인
export async function isSubscribed() {
  const session = await getSession();
  if (!session) return false;
  const { data } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', session.user.id)
    .single();
  if (!data) return false;
  return data.status === 'active' && new Date(data.current_period_end) > new Date();
}

// 로그아웃
export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/auth.html';
}
