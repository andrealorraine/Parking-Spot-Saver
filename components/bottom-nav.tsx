'use client'

import { Car, History, Home, SquareParking } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/save', label: 'Save', icon: SquareParking },
  { href: '/car', label: 'My car', icon: Car },
  { href: '/history', label: 'History', icon: History },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-foreground/80 bg-secondary text-secondary-foreground pb-safe"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium uppercase tracking-wide transition-colors',
                  active ? 'text-primary' : 'text-secondary-foreground/70 hover:text-secondary-foreground',
                )}
              >
                <Icon className="size-6" aria-hidden="true" strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
