import type React from 'react'

export function ComingSoon({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/40 text-accent-foreground">
        {icon}
      </span>
      <h2 className="text-2xl font-bold tracking-tight text-balance">{title}</h2>
      <p className="text-pretty text-muted-foreground">{description}</p>
      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
        เร็ว ๆ นี้
      </span>
    </div>
  )
}
