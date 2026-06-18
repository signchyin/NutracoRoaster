import type React from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardTopbar } from '@/components/dashboard/topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return (
    <div className="flex min-h-svh bg-background">
      <DashboardSidebar
          name={session.user.name}
          email={session.user.email}
          image={session.user.image ?? null}
        />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          name={session.user.name}
          email={session.user.email}
          image={session.user.image ?? null}
        />
        <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
