'use client';
import { useEffect, useState } from 'react';
import Nav from '@/app/components/Nav';
import { createClient } from '@/lib/supabase';

export default function Items() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ name:'', unit:'', min:0, location:'', vendor:'', note:'' });
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from('item_view').select('*').order('name');
    setItems(data || []);
  }
  useEffect(()=>{ load(); }, []);

  async function upsert() {
    if (!form.name.trim()) return;
    const { error } = await supabase.from('items').upsert({
      name: form.name.trim(),
      unit: form.unit || null,
      min: Number(form.min)||0,
      location: form.location || null,
      vendor: form.vendor || null,
      note: form.note || null
    });
    if(!error){ setForm({ name:'', unit:'', min:0, location:'', vendor:'', note:'' }); load(); }
  }
  async function adjustQty(id, delta) {
    const { error } = await supabase.rpc('adjust_stock', { p_item_id:id, p_delta: delta });
    if(!error) load();
  }

  const filtered = items.filter(i =>
    (i.name+' '+(i.location||'')+' '+(i.vendor||'')).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <Nav />
      <div className="bg-[var(--panel)] border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            placeholder="Search items, location, vendor…"
            value={q}
            onChange={e=>setQ(e.target.value)}
            className="w-full md:w-80 px-3 py-2 rounded-md border border-gray-300"
          />
        </div>

        <h3 className="mt-5 mb-2 font-semibold">Add / Update Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="px-3 py-2 rounded-md border border-gray-300" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
          <input className="px-3 py-2 rounded-md border border-gray-300" placeholder="Unit (box, ea…)" value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})}/>
          <input className="px-3 py-2 rounded-md border border-gray-300" placeholder="Min" type="number" value={form.min} onChange={e=>setForm({...form, min:e.target.value})}/>
          <input className="px-3 py-2 rounded-md border border-gray-300" placeholder="Location" value={form.location} onChange={e=>setForm({...form, location:e.target.value})}/>
          <input className="px-3 py-2 rounded-md border border-gray-300" placeholder="Vendor" value={form.vendor} onChange={e=>setForm({...form, vendor:e.target.value})}/>
          <input className="px-3 py-2 rounded-md border border-gray-300" placeholder="Note" value={form.note} onChange={e=>setForm({...form, note:e.target.value})}/>
        </div>
        <div className="mt-3">
          <button onClick={upsert} className="px-4 py-2 rounded-md bg-brand-500 text-white hover:bg-brand-600">Save</button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-2">Name</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Min</th>
                <th className="py-2">Unit</th><th className="py-2">Location</th><th className="py-2">Vendor</th><th className="py-2">Note</th><th className="py-2">Status</th><th />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(it => (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="py-2">{it.name}</td>
                  <td className="py-2 text-right">{it.qty}</td>
                  <td className="py-2 text-right">{it.min}</td>
                  <td className="py-2">{it.unit||''}</td>
                  <td className="py-2">{it.location||''}</td>
                  <td className="py-2">{it.vendor||''}</td>
                  <td className="py-2">{it.note||''}</td>
                  <td className="py-2">
                    {it.qty < it.min ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Needs</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">OK</span>
                    )}
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    <button onClick={()=>adjustQty(it.id, 1)} className="px-2 py-1 rounded-md border border-gray-300 mr-1">+1</button>
                    <button onClick={()=>adjustQty(it.id, -1)} className="px-2 py-1 rounded-md border border-gray-300">-1</button>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && (
                <tr><td colSpan={10} className="py-6 text-center text-gray-500">No items yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
