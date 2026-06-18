import Link from "next/link"
import Image from "next/image"

export function CtaSection() {
  return (
    <section
      aria-label="เริ่มใช้งาน"
      className="bg-[linear-gradient(135deg,#70504a,#9c7259)] text-white"
    >
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
          เริ่มจัดการโรงคั่วให้เป็นระบบ วันนี้เลย
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-white/90">
          ทดลองใช้ฟรี 30 วัน นำเข้าข้อมูลเดิมได้ทันที
          <br />
          ไม่ต้องใส่บัตรเครดิต ไม่ผูกมัด
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-primary transition-colors hover:bg-white/90 sm:w-auto"
          >
            สร้างบัญชีฟรีเลย
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            มีบัญชีแล้ว เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/40">
            <Image src="/mascot.png" alt="" width={28} height={28} className="h-6 w-6 object-contain" aria-hidden="true" />
          </span>
          <span className="text-sm font-bold">Roastery</span>
          <span className="text-sm text-muted-foreground">— ระบบจัดการโรงคั่วกาแฟ</span>
        </div>
        <nav aria-label="ลิงก์ท้ายหน้า" className="flex items-center gap-6">
          <Link href="/sign-in" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            เข้าสู่ระบบ
          </Link>
          <Link href="/sign-up" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            สมัครใช้งาน
          </Link>
          <span className="text-sm text-muted-foreground">© 2026 Roastery</span>
        </nav>
      </div>
    </footer>
  )
}
