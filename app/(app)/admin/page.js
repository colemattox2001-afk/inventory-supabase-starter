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
    const { error } = await supabase.rpc('create_tenant_with_admin', { p_name: tenantName, p_admin_email: inviteEmail });
    setMsg(error ? error.message : 'Clinic created, admin invited (check email).');
  };

  return (
    <div>
      <Nav />
      <div className="bg-[var(--panel)] border border-gray-200 rounded-xl p-4 max-w-xl">
        <h2 className="text-lg font-semibold mb-3">Onboard a Clinic</h2>
        <div className="grid gap-3">
          <input className="px-3 py-2 rounded-md border border-gray-300" placeholder="Clinic name" value={tenantName} onChange={e=>setTenantName(e.target.value)} />
          <input className="px-3 py-2 rounded-md border border-gray-300" placeholder="Admin email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} />
          <button onClick={createTenant} className="px-4 py-2 rounded-md bg-brand-500 text-white hover:bg-brand-600">Create clinic + invite admin</button>
          <div className="text-sm text-gray-600">{msg}</div>
        </div>
        <p className="text-xs text-gray-500 mt-3">In production, restrict this page to HQ admins.</p>
      </div>
    </div>
  );
}
