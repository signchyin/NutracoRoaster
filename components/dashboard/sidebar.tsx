'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Coffee,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'ปฏิทินคั่ว', icon: CalendarDays },
  { href: '/dashboard/orders', label: 'ออเดอร์', icon: ShoppingCart },
  { href: '/dashboard/inventory', label: 'สต็อกเมล็ด', icon: Package },
  { href: '/dashboard/customers', label: 'ลูกค้า', icon: Users },
  { href: '/dashboard/reports', label: 'รายงาน', icon: BarChart3 },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent/50">
          <Image
            src="/mascot.png"
            alt=""
            width={32}
            height={32}
            className="h-7 w-7 object-contain"
            aria-hidden="true"
          />
        </span>
        <span className="text-lg font-bold tracking-tight">Roastery</span>
      </div>

      <nav aria-label="เมนูแดชบอร์ด" className="flex flex-1 flex-col gap-1 p-3">
        {nav.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground',
              )}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/30 px-3 py-2.5 text-sm">
          <Coffee className="h-[18px] w-[18px] text-sidebar-accent-foreground" aria-hidden="true" />
          <span className="font-medium">โรงคั่วของฉัน</span>
        </div>
      </div>
    </aside>
  )
}
