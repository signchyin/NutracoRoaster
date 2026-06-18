import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { BrowserFrame } from "@/components/browser-frame"

const heroFeatures = [
  "จัดการออเดอร์ B2B + B2C",
  "คิวคั่วกาแฟแบบ Kanban",
  "ออกใบแจ้งหนี้ในระบบ",
  "ปฏิทินทีมรวมทุกกิจกรรม",
  "หลายผู้ใช้ + สิทธิ์แยกบทบาท",
]

export function HeroSection() {
  return (
    <section aria-label="แนะนำผลิตภัณฑ์" className="bg-card">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            ออกแบบมาสำหรับ Specialty Coffee Roaster ในไทย
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            จัดการโรงคั่วกาแฟ
            <br />
            <span className="text-primary">ให้เป็นระบบ ในที่เดียว</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            เลิกใช้ Excel หลายไฟล์และ LINE กลุ่ม — รับออเดอร์ B2B/B2C วางคิวคั่ว ออกใบแจ้งหนี้
            ทุกอย่างเชื่อมกันอัตโนมัติในระบบเดียว
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            >
              ทดลองใช้ฟรี 30 วัน
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="#features"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-secondary sm:w-auto"
            >
              ดูฟีเจอร์ทั้งหมด
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            ไม่ต้องใส่บัตรเครดิต · ยกเลิกเมื่อไหร่ก็ได้ · ข้อมูลของคุณปลอดภัย 100%
          </p>
        </div>

        <div className="mt-14">
          <BrowserFrame url="app.roastery.co/orders">
            <Image
              src="/screens/orders.png"
              alt="หน้าจอระบบจัดการออเดอร์ของ Roastery แสดงรายการออเดอร์ B2B และ B2C พร้อมสถานะการดำเนินการ"
              width={1600}
              height={1000}
              className="w-full"
              priority
            />
          </BrowserFrame>
        </div>
      </div>

      <div className="border-y border-border bg-secondary/50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-5 sm:px-6">
          {heroFeatures.map((feature) => (
            <span key={feature} className="text-sm font-medium text-muted-foreground">
              {feature}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
