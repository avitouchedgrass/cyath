import { redirect } from 'next/navigation';

export default function RecipesPage() {
  redirect('/playbook?tab=recipes');
}
