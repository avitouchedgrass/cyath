import { redirect } from 'next/navigation';

export default function ProtocolsPage() {
  redirect('/playbook?tab=protocols');
}
