export const metadata = { title: 'Inventory', description: 'Multi-tenant inventory with Supabase' };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{margin:0, background:'#0f0f0f', color:'#f5f5f5', fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'}}>
        <link rel="manifest" href="/manifest.json" />
        <div style={{maxWidth:1000, margin:'0 auto', padding:16}}>{children}</div>
      </body>
    </html>
  );
}