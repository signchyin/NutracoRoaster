'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import {
  CalendarDays,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  LogOut,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const titles: Record<string, string> = {
  '/dashboard': 'ปฏิทินคั่ว',
  '/dashboard/orders': 'ออเดอร์',
  '/dashboard/inventory': 'สต็อกเมล็ด',
  '/dashboard/customers': 'ลูกค้า',
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
  const router = useRouter()
  const pathname = usePathname()

  const title =
    titles[pathname] ??
    (pathname.startsWith('/dashboard/') ? 'แดชบอร์ด' : 'แดชบอร์ด')

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
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight">{title}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            จัดการโรงคั่วกาแฟของคุณ
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none ring-ring focus-visible:ring-2">
            <Avatar className="h-9 w-9">
              {image ? <AvatarImage src={image || '/placeholder.svg'} alt="" /> : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {initials || 'R'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="truncate font-semibold">{name}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav
        aria-label="เมนูมือถือ"
        className="flex items-center gap-1 overflow-x-auto border-t border-border/60 px-2 py-2 md:hidden"
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
