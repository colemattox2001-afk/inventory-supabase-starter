'use client';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

const Tab = ({ href, children }) => {
  const path = usePathname();
  const active = path.startsWith(href);
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        active ? 'bg-brand-50 text-brand-600' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
};

export default function Nav() {
  const router = useRouter();
  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-brand-500 text-white grid place-items-center font-bold">IV</div>
          <div className="text-lg font-semibold">Inventory</div>
        </div>
        <button
          onClick={signOut}
          className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
      <nav className="mt-4 flex gap-2">
        <Tab href="/items">Items</Tab>
        <Tab href="/needs">Needs</Tab>
        <Tab href="/import">Import</Tab>
        <Tab href="/admin">Admin</Tab>
      </nav>
    </header>
  );
}
