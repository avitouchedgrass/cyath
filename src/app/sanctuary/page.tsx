import { redirect } from 'next/navigation';

export default function SanctuaryPage() {
  redirect('/dashboard?tab=today');
}
