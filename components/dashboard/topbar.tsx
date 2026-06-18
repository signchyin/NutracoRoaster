'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const titles: Record<string, string> = {
  '/dashboard': 'ปฏิทิน',
  '/dashboard/overview': 'ภาพรวม',
  '/dashboard/orders': 'รายการสั่งซื้อ',
  '/dashboard/customers': 'ลูกค้า',
  '/dashboard/inventory': 'สารกาแฟ (LOT)',
  '/dashboard/roast-queue': 'คิวการคั่ว',
  '/dashboard/roast-done': 'กาแฟคั่วสำเร็จ',
  '/dashboard/packing': 'กิมแพ็คสินค้า',
  '/dashboard/products': 'สินค้า',
  '/dashboard/settings': 'ตั้งค่าระบบ',
  '/dashboard/reports': 'รายงาน',
}

const mobileNav = [
  { href: '/dashboard', label: 'ปฏิทิน', icon: CalendarDays },
  { href: '/dashboard/orders', label: 'ออเดอร์', icon: ShoppingCart },
  { href: '/dashboard/inventory', label: 'สต็อก', icon: Package },
  { href: '/dashboard/customers', label: 'ลูกค้า', icon: Users },
  { href: '/dashboard/reports', label: 'รายงาน', icon: BarChart3 },
]

export function DashboardTopbar({
  name,
  email,
  image,
}: {
  name: string
  email: string
  image: string | null
}) {
  const pathname = usePathname()

  const title = titles[pathname] ?? 'แดชบอร์ด'

  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:block truncate max-w-[140px]">
            {name}
          </span>
          <Avatar className="h-8 w-8">
            {image ? <AvatarImage src={image} alt="" /> : null}
            <AvatarFallback className="bg-amber-100 text-amber-800 text-xs font-semibold">
              {initials || 'NR'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="เมนูมือถือ"
        className="flex items-center gap-1 overflow-x-auto border-t border-border px-2 py-2 md:hidden"
      >
        {mobileNav.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
