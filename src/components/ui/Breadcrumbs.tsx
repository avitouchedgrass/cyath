import React from 'react';
import Link from 'next/link';
import { PixelChevronRight, PixelHome } from '@/components/common/PixelIcons';
import { BreadcrumbsJsonLd } from '@/components/seo/JsonLd';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const DEFAULT_ROUTE_MAP: Record<string, string> = {
  'Playbook': '/playbook',
  'Focus Protocols': '/playbook',
  'Guided Routines': '/playbook',
  'Daily Insights': '/dashboard?tab=dossier',
  'Insights': '/dashboard?tab=dossier',
  'Sanctuary': '/dashboard?tab=today',
  'Profile': '/profile',
  'Privacy Policy': '/privacy',
  'Terms of Service': '/terms',
};

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const allItems = [{ label: 'Home', href: '/' }, ...items];

  const jsonLdItems = allItems.map((item) => ({
    name: item.label,
    item: item.href || DEFAULT_ROUTE_MAP[item.label] || `/${item.label.toLowerCase().replace(/\s+/g, '-')}`,
  }));

  return (
    <>
      <BreadcrumbsJsonLd items={jsonLdItems} />
      <nav aria-label="Breadcrumb" className={`flex items-center text-xs font-mono font-bold ${className}`}>
        <ol className="flex items-center flex-wrap gap-1.5 p-1.5 px-3 rounded-full border border-[#1A3629]/15 bg-[#FFFDF9]/95 backdrop-blur-xs shadow-2xs">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;

            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <PixelChevronRight size={12} color="#4A5D4E" className="shrink-0" />
                )}
                {isLast || !item.href ? (
                  <span className="text-[#1A3629] font-black flex items-center gap-1" aria-current="page">
                    {index === 0 ? <PixelHome size={13} color="#1A3629" /> : null}
                    <span>{item.label}</span>
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-[#4A5D4E] hover:text-[#1A3629] hover:underline transition-colors flex items-center gap-1"
                  >
                    {index === 0 ? <PixelHome size={13} color="#4A5D4E" /> : null}
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
