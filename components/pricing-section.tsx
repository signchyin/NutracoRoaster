import Link from "next/link"
import { Check } from "lucide-react"

const included = [
  "ฟีเจอร์ทั้งหมดที่เปิดใช้งานแล้ว",
  "จำนวนผู้ใช้ไม่จำกัด",
  "พื้นที่ข้อมูลไม่จำกัด",
  "ทดลองฟรี 30 วัน ไม่ต้องใส่บัตรเครดิต",
  "รับฟีเจอร์ใหม่ทุกอัปเดตฟรีตลอด",
]

export function PricingSection() {
  return (
    <section id="pricing" className="bg-background">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            ราคาตรงไปตรงมา ไม่มีซ่อน
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            ไม่มีค่าติดตั้ง ไม่มี tier ซับซ้อน จ่ายเดือนเดียว ได้ใช้เต็มระบบทันที
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* Monthly */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-8">
            <p className="text-sm font-medium text-muted-foreground">รายเดือน</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight">฿999</span>
              <span className="text-sm text-muted-foreground">/เดือน</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              ยืดหยุ่น หยุดใช้เมื่อไหร่ก็ได้ ไม่ผูกสัญญา
            </p>
            <Link
              href="/sign-up"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              เริ่มทดลองใช้ฟรี
            </Link>
          </div>

          {/* Yearly - highlighted */}
          <div className="relative flex flex-col rounded-2xl border-2 border-primary bg-card p-8 shadow-xl shadow-primary/10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              ประหยัดที่สุด · 2 เดือนฟรี
            </span>
            <p className="text-sm font-medium text-muted-foreground">รายปี</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight">฿9,999</span>
              <span className="text-sm text-muted-foreground">/ปี</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              เทียบเท่า ฿833/เดือน — ประหยัดไป ฿2,988/ปี
            </p>
            <Link
              href="/sign-up"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              เริ่มทดลองใช้ฟรี
            </Link>
          </div>
        </div>

        <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {included.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 flex-none text-primary" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
