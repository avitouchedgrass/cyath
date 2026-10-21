'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHabitStore } from '@/store/useHabitStore';

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    useHabitStore.getState().initDemoSession();
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center text-[#1A3629] font-mono text-xs">
      Launching Sanctuary Demo...
    </div>
  );
}
