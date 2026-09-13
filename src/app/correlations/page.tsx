import { redirect } from 'next/navigation';

export default function CorrelationsPage() {
  redirect('/dashboard?tab=dossier');
}
