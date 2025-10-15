'use client';
import { useEffect, useState } from 'react';
import Nav from '@/app/components/Nav';
import { createClient } from '@/lib/supabase';
export default function Needs() {
  const [rows, setRows] = useState([]);
  const supabase = createClient();
  useEffect(() => { (async () => {
    const { data } = await supabase.from('needs_view').select('*').order('name');
    setRows(data||[]);
  })(); }, []);
  return (
    <div>
      <Nav />
      <h2>Needs Ordered</h2>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead><tr><th align="left">Name</th><th align="right">Qty</th><th align="right">Min</th><th>Unit</th><th>Location</th><th>Vendor</th><th>Note</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{borderTop:'1px solid #222'}}>
              <td>{r.name}</td>
              <td align="right">{r.qty}</td>
              <td align="right">{r.min}</td>
              <td>{r.unit||''}</td>
              <td>{r.location||''}</td>
              <td>{r.vendor||''}</td>
              <td>{r.note||''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
