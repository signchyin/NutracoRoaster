'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  CalendarDays,
  LayoutGrid,
  ShoppingCart,
  Users,
  Package,
  Flame,
  CheckSquare,
  Archive,
  Coffee,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navGroups = [
  {
    items: [
      { href: '/dashboard', label: 'ปฏิทิน', icon: CalendarDays },
      { href: '/dashboard/overview', label: 'ภาพรวม', icon: LayoutGrid },
    ],
  },
  {
    label: 'ขาย',
    items: [
      { href: '/dashboard/orders', label: 'รายการสั่งซื้อ', icon: ShoppingCart },
      { href: '/dashboard/customers', label: 'ลูกค้า', icon: Users },
    ],
  },
  {
    label: 'การผลิต',
    items: [
      { href: '/dashboard/inventory', label: 'สารกาแฟ (LOT)', icon: Package },
      { href: '/dashboard/roast-queue', label: 'คิวการคั่ว', icon: Flame },
      { href: '/dashboard/roast-done', label: 'กาแฟคั่วสำเร็จ', icon: CheckSquare },
      { href: '/dashboard/packing', label: 'กิมแพ็คสินค้า', icon: Archive },
      { href: '/dashboard/products', label: 'สินค้า', icon: Coffee },
    ],
  },
  {
    label: 'ตั้งค่า',
    items: [
      { href: '/dashboard/settings', label: 'ตั้งค่าระบบ', icon: Settings },
    ],
  },
]

export function DashboardSidebar({
  name,
  email,
  image,
}: {
  name: string
  email: string
  image: string | null
}) {
  const pathname = usePathname()
  const router = useRouter()

  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <aside className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col border-r border-border bg-white text-foreground md:flex">
      {/* Company header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <Avatar className="h-9 w-9 shrink-0">
          {image ? <AvatarImage src={image} alt="" /> : null}
          <AvatarFallback className="bg-amber-100 text-amber-800 text-sm font-semibold">
            {initials || 'NR'}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">{name}</p>
          <p className="truncate text-[11px] text-muted-foreground leading-tight">PLATFORM</p>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="เมนูหลัก" className="flex flex-1 flex-col gap-0 overflow-y-auto px-3 py-3">
        {navGroups.map((group, gi) => (
          <div key={gi} className={cn('flex flex-col', gi > 0 && 'mt-4')}>
            {group.label && (
              <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
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
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/70 hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <Icon className="h-[17px] w-[17px] shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="border-t border-border px-3 py-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-[17px] w-[17px] shrink-0" aria-hidden="true" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  )
}
