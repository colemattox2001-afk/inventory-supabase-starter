'use client';
import { useState } from 'react';
import Nav from '@/app/components/Nav';
import { createClient } from '@/lib/supabase';
export default function Admin() {
  const [tenantName, setTenantName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [msg, setMsg] = useState('');
  const supabase = createClient();
  const createTenant = async () => {
    const { data, error } = await supabase.rpc('create_tenant_with_admin', { p_name: tenantName, p_admin_email: inviteEmail });
    if (error) setMsg(error.message);
    else setMsg('Tenant created and admin invited (check email).');
  };
  return (
    <div>
      <Nav />
      <h2>Admin / Onboarding</h2>
      <div style={{display:'grid', gap:8, maxWidth:480}}>
        <input placeholder="Clinic name" value={tenantName} onChange={e=>setTenantName(e.target.value)} />
        <input placeholder="Admin email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} />
        <button onClick={createTenant} style={{padding:10, borderRadius:10}}>Create clinic + invite admin</button>
        <div style={{opacity:0.7}}>{msg}</div>
      </div>
      <p style={{opacity:0.7, marginTop:16}}>Lock this page to HQ admins only in production.</p>
    </div>
  );
}
