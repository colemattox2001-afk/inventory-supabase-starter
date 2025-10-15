'use client';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
export default function Nav() {
  const router = useRouter();
  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };
  return (
    <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:12}}>
      <Link href="/items">Items</Link>
      <Link href="/needs">Needs</Link>
      <Link href="/admin">Admin</Link>
      <div style={{flex:1}} />
      <button onClick={signOut} style={{padding:'6px 10px', borderRadius:8}}>Sign out</button>
    </div>
  );
}