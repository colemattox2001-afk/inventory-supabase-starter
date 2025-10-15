'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
export default function Home() {
  const router = useRouter();
  useEffect(() => { (async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    router.replace(user ? '/items' : '/login');
  })(); }, [router]);
  return <p style={{opacity:0.6}}>Loading…</p>;
}