import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
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
  'Fuel Recipes': '/recipes',
  'Guided Routines': '/protocols',
  'Daily Insights': '/correlations',
  'Sanctuary': '/sanctuary',
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
        <ol className="flex items-center flex-wrap gap-1.5 p-1.5 px-3 rounded-full border-2 border-[#1A3629]/20 bg-[#FFFDF9]/80 shadow-[2px_2px_0px_rgba(26,54,41,0.1)]">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;

            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" aria-hidden="true" />
                )}
                {isLast || !item.href ? (
                  <span className="text-[#1A3629] font-black" aria-current="page">
                    {index === 0 ? <Home className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> : null}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-[#4A5D4E] hover:text-[#1A3629] hover:underline transition-colors flex items-center gap-1"
                  >
                    {index === 0 ? <Home className="w-3.5 h-3.5" /> : null}
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
