'use client';
import { useEffect, useState } from 'react';
import Nav from '../components/Nav';
import { createClient } from '@/lib/supabase';
export default function Items() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ name:'', unit:'', min:0, location:'', vendor:'', note:'' });
  const supabase = createClient();
  async function load() {
    const { data } = await supabase.from('item_view').select('*').order('name');
    setItems(data||[]);
  }
  useEffect(()=>{ load(); }, []);
  async function upsert() {
    const { error } = await supabase.from('items').upsert({ 
      name: form.name, unit: form.unit || null, min: Number(form.min)||0, 
      location: form.location || null, vendor: form.vendor || null, note: form.note || null 
    });
    if(!error){ setForm({ name:'', unit:'', min:0, location:'', vendor:'', note:'' }); load(); }
  }
  async function adjustQty(id, delta) {
    const { error } = await supabase.rpc('adjust_stock', { p_item_id:id, p_delta: delta });
    if(!error) load();
  }
  const filtered = items.filter(i => (i.name+' '+(i.location||'')+' '+(i.vendor||'')).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <Nav />
      <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:10}}>
        <input placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      <div style={{border:'1px solid #222', borderRadius:12, padding:12, marginBottom:16}}>
        <h3 style={{marginTop:0}}>Add/Update Item</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8}}>
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          <input placeholder="Unit (box, ea…)" value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})} />
          <input placeholder="Min" type="number" value={form.min} onChange={e=>setForm({...form, min:e.target.value})} />
          <input placeholder="Location" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} />
          <input placeholder="Vendor" value={form.vendor} onChange={e=>setForm({...form, vendor:e.target.value})} />
          <input placeholder="Note" value={form.note} onChange={e=>setForm({...form, note:e.target.value})} />
        </div>
        <div style={{marginTop:8}}>
          <button onClick={upsert} style={{padding:10, borderRadius:10}}>Save</button>
        </div>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead><tr><th align="left">Name</th><th align="right">Qty</th><th align="right">Min</th><th>Unit</th><th>Location</th><th>Vendor</th><th>Note</th><th>Status</th><th /></tr></thead>
        <tbody>
          {filtered.map(it => (
            <tr key={it.id} style={{borderTop:'1px solid #222'}}>
              <td>{it.name}</td>
              <td align="right">{it.qty}</td>
              <td align="right">{it.min}</td>
              <td>{it.unit||''}</td>
              <td>{it.location||''}</td>
              <td>{it.vendor||''}</td>
              <td>{it.note||''}</td>
              <td>{it.qty < it.min ? 'Needs' : 'OK'}</td>
              <td>
                <button onClick={()=>adjustQty(it.id, 1)} style={{marginRight:6}}>+1</button>
                <button onClick={()=>adjustQty(it.id, -1)}>-1</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}