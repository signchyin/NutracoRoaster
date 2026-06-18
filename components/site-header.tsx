import Link from "next/link"
import Image from "next/image"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Roastery หน้าหลัก">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/40">
            <Image src="/mascot.png" alt="" width={32} height={32} className="h-7 w-7 object-contain" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight">Roastery</span>
        </Link>

        <nav aria-label="เมนูหลัก" className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            ฟีเจอร์
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            ราคา
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="#"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="#"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            ทดลองฟรี
          </Link>
        </div>
      </div>
    </header>
  )
}
