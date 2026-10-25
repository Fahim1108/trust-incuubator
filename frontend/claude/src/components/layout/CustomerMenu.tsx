'use client';
import Link from 'next/link';
import { User } from 'lucide-react';

/** This isolated app has no verified customer session; never render a pretend signed-in menu. */
export function CustomerMenu() {
  return <details className="group/account relative hidden sm:block">
    <summary aria-label="Account menu" className="aa-press flex min-h-11 min-w-8 cursor-pointer list-none flex-col items-center justify-center gap-1 rounded text-ink transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
      <User size={22} strokeWidth={1.5}/><span className="hidden text-[11px] lg:block">Account</span>
    </summary>
    <nav aria-label="Customer account" className="absolute right-0 top-full z-50 mt-2 w-48 animate-dropdown-in rounded-lg border border-line bg-white p-2 shadow-lift">
      {([['Sign In','/account/login'],['Create Account','/account/register'],['My Account','/account'],['My Orders','/account/orders'],['Wishlist','/wishlist']] as const).map(([label,href])=><Link key={href} href={href} onClick={e=>e.currentTarget.closest('details')?.removeAttribute('open')} className="block rounded px-3 py-2.5 text-sm hover:bg-selected hover:text-primary">{label}</Link>)}
    </nav>
  </details>;
}
