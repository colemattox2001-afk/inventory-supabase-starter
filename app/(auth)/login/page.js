'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();
  const handle = async (e) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMsg(error.message); return; }
    router.push('/items');
  };
  return (
    <div>
      <h1 style={{fontSize:20, marginBottom:12}}>Sign in</h1>
      <form onSubmit={handle} style={{display:'grid', gap:8, maxWidth:420}}>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit" style={{padding:10, borderRadius:10, fontWeight:700}}>Sign in</button>
        <div style={{opacity:0.7}}>{msg}</div>
      </form>
    </div>
  );
}