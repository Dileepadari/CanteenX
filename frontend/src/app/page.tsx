import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to canteen home
  redirect('/canteen/home');
}