import {redirect} from 'next/navigation';
/** Stable same-domain entry point; the existing protected sign-in flow is retained. */
export default function AdminLogin(){redirect('/admin/sign-in');}
