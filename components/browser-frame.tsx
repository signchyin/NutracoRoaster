import type { ReactNode } from "react"

export function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/5 ring-1 ring-black/5">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-border" />
          <span className="h-3 w-3 rounded-full bg-border" />
          <span className="h-3 w-3 rounded-full bg-border" />
        </div>
        <div className="mx-auto flex h-6 w-full max-w-sm items-center justify-center rounded-md bg-background px-3 text-xs text-muted-foreground">
          {url}
        </div>
      </div>
      <div className="bg-card">{children}</div>
    </div>
  )
}
