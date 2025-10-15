'use client';
import { useState } from 'react';
import Nav from '@/app/components/Nav';
import { createClient } from '@/lib/supabase';
import Papa from 'papaparse';

const normalize = (s='') => s.trim().toLowerCase().replace(/\s+/g,'_');

export default function ImportPage() {
  const supabase = createClient();
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const template = `name,min,unit,location,vendor,note,initial_qty
Gloves,10,box,Supply Closet,ACME,"Nitrile, blue",50
Gauze 4x4,20,pack,Room 2,MedLine,,100`;

  // Download template CSV
  const downloadTemplate = () => {
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'inventory_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // Handle CSV file select
  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => normalize(h),
      complete: (res) => {
        const hs = res.meta.fields?.map(normalize) || [];
        setHeaders(hs);
        // clean rows: keep known fields
        const cleaned = (res.data || []).map(r => ({
          name: r.name?.trim() || '',
          min: r.min ? Number(r.min) : 0,
          unit: r.unit?.trim() || '',
          location: r.location?.trim() || '',
          vendor: r.vendor?.trim() || '',
          note: r.note?.trim() || '',
          initial_qty: r.initial_qty !== undefined && r.initial_qty !== '' ? Number(r.initial_qty) : null
        })).filter(r => r.name);
        setRows(cleaned);
        setMsg(`Loaded ${cleaned.length} rows.`);
      },
      error: (err) => setMsg(err.message)
    });
  };

  const importData = async () => {
    if (rows.length === 0) { setMsg('No rows to import.'); return; }
    setBusy(true); setMsg('Upserting items…');

    // 1) Upsert items (tenant_id filled by trigger)
    const itemsToUpsert = rows.map(r => ({
      name: r.name,
      unit: r.unit || null,
      min: Number.isFinite(r.min) ? r.min : 0,
      location: r.location || null,
      vendor: r.vendor || null,
      note: r.note || null
    }));
    const { error: upErr } = await supabase.from('items').upsert(itemsToUpsert);
    if (upErr) { setBusy(false); setMsg('Error upserting items: ' + upErr.message); return; }

    // 2) If initial_qty supplied, align stock to that value
    const wantQty = rows.filter(r => r.initial_qty !== null && Number.isFinite(r.initial_qty));
    if (wantQty.length) {
      setMsg('Setting initial quantities…');

      // Fetch current qty + ids for the named items
      const names = [...new Set(wantQty.map(r => r.name))];
      const { data: current } = await supabase.from('item_view').select('id,name,qty').in('name', names);

      // Build a map name -> {id, qty}
      const map = new Map((current || []).map(r => [r.name, { id: r.id, qty: Number(r.qty)||0 }]));

      // For each row, compute delta and adjust via RPC
      for (const r of wantQty) {
        const rec = map.get(r.name);
        if (!rec) continue;
        const delta = Number(r.initial_qty) - Number(rec.qty || 0);
        if (delta !== 0) {
          // Call RPC; ignore small errors to keep going
          await supabase.rpc('adjust_stock', { p_item_id: rec.id, p_delta: delta });
        }
      }
    }

    setBusy(false);
    setMsg('Import complete. Go to Items to see everything.');
  };

  return (
    <div>
      <Nav />
      <div className="bg-[var(--panel)] border border-gray-200 rounded-xl p-4 max-w-3xl">
        <h2 className="text-lg font-semibold mb-2">CSV Import</h2>
        <p className="text-sm text-gray-600 mb-4">
          Required column: <code>name</code>. Optional: <code>min</code>, <code>unit</code>, <code>location</code>, <code>vendor</code>, <code>note</code>, <code>initial_qty</code>.
        </p>

        <div className="flex gap-2 mb-3">
          <input type="file" accept=".csv" onChange={onFile}
                 className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:text-gray-700 hover:file:bg-gray-50" />
          <button onClick={downloadTemplate} className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
            Download template
          </button>
        </div>

        {rows.length > 0 && (
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 text-sm text-gray-600">
              Preview ({rows.length} rows)
            </div>
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white text-left text-gray-500">
                  <tr>
                    <th className="p-2">name</th>
                    <th className="p-2">min</th>
                    <th className="p-2">unit</th>
                    <th className="p-2">location</th>
                    <th className="p-2">vendor</th>
                    <th className="p-2">note</th>
                    <th className="p-2">initial_qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.slice(0,100).map((r,i)=>(
                    <tr key={i}>
                      <td className="p-2">{r.name}</td>
                      <td className="p-2">{r.min}</td>
                      <td className="p-2">{r.unit}</td>
                      <td className="p-2">{r.location}</td>
                      <td className="p-2">{r.vendor}</td>
                      <td className="p-2">{r.note}</td>
                      <td className="p-2">{r.initial_qty ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 100 && <div className="px-3 py-2 text-xs text-gray-500">Showing first 100 rows…</div>}
          </div>
        )}

        <div className="mt-3 flex items-center gap-3">
          <button disabled={busy || rows.length===0} onClick={importData}
                  className={`px-4 py-2 rounded-md ${busy||rows.length===0 ? 'bg-gray-300 text-gray-600' : 'bg-brand-500 text-white hover:bg-brand-600'}`}>
            {busy ? 'Importing…' : 'Import'}
          </button>
          <div className="text-sm text-gray-600">{msg}</div>
        </div>
      </div>
    </div>
  );
}
