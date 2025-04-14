import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to admin dashboard
  redirect('/admin/dashboard');
}