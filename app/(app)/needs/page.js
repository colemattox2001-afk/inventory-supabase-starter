'use client';
import { useEffect, useState } from 'react';
import Nav from '@/app/components/Nav';
import { createClient } from '@/lib/supabase';

export default function Needs() {
  const [rows, setRows] = useState([]);
  const supabase = createClient();

  useEffect(() => { (async () => {
    const { data } = await supabase.from('needs_view').select('*').order('name');
    setRows(data || []);
  })(); }, []);

  return (
    <div>
      <Nav />
      <div className="bg-[var(--panel)] border border-gray-200 rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">Needs Ordered</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-2">Name</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Min</th>
                <th className="py-2">Unit</th><th className="py-2">Location</th><th className="py-2">Vendor</th><th className="py-2">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-2">{r.name}</td>
                  <td className="py-2 text-right">{r.qty}</td>
                  <td className="py-2 text-right">{r.min}</td>
                  <td className="py-2">{r.unit||''}</td>
                  <td className="py-2">{r.location||''}</td>
                  <td className="py-2">{r.vendor||''}</td>
                  <td className="py-2">{r.note||''}</td>
                </tr>
              ))}
              {rows.length===0 && (
                <tr><td colSpan={7} className="py-6 text-center text-gray-500">Nothing below minimum 🎉</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
