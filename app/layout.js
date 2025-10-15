export const metadata = { title: 'Inventory', description: 'Clinic inventory' };
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[var(--bg)] text-[var(--text)]">
        <div className="min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
        </div>
      </body>
    </html>
  );
}
