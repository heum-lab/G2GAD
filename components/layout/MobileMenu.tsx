'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type MobileMenuProps = {
  items: readonly { href: string; label: string }[];
};

export function MobileMenu({ items }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="rounded-control hover:bg-muted inline-flex size-11 items-center justify-center"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
        onClick={() => setIsOpen((value) => !value)}
      >
        {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <nav
        id="mobile-menu"
        aria-label="모바일 메뉴"
        hidden={!isOpen}
        className="border-border bg-background absolute inset-x-0 top-full border-b shadow-lg"
      >
        <ul className="px-5 py-3">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block py-3 text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
