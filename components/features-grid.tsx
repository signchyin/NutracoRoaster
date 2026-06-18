import { ClipboardList, Users, Flame, FileText, CalendarDays, ShieldCheck } from "lucide-react"

const features = [
  {
    icon: ClipboardList,
    title: "จัดการออเดอร์ครบวงจร",
    desc: "รับและติดตามออเดอร์ทั้ง B2B (คาเฟ่/โรงแรม) และ B2C (ลูกค้าออนไลน์) ในระบบเดียว ไม่มีตกหล่นอีกต่อไป",
  },
  {
    icon: Users,
    title: "CRM ลูกค้า",
    desc: "เก็บข้อมูลลูกค้า ดูประวัติการสั่งซื้อย้อนหลัง และแยกกลุ่ม B2B/B2C ได้ชัดเจน ไม่ต้องจำเองทุกอย่าง",
  },
  {
    icon: Flame,
    title: "คิวคั่วกาแฟ",
    desc: "Kanban board สำหรับวางแผนแบตช์คั่ว เชื่อมกับออเดอร์ที่รอส่งโดยอัตโนมัติ รู้ทันทีว่าต้องคั่วอะไรวันนี้",
  },
  {
    icon: FileText,
    title: "การเงินและใบแจ้งหนี้",
    desc: "สร้างใบแจ้งหนี้และใบเสร็จได้ในไม่กี่คลิก ติดตามสถานะชำระ รู้ทันทีว่าลูกค้ารายไหนค้างจ่ายอยู่",
  },
  {
    icon: CalendarDays,
    title: "ปฏิทินทีม",
    desc: "รวมออเดอร์ คิวคั่ว และวันครบกำหนดชำระในปฏิทินเดียว ทุกคนในทีมเห็นภาพรวมตรงกัน ไม่พลาดนัด",
  },
  {
    icon: ShieldCheck,
    title: "หลายผู้ใช้ + สิทธิ์",
    desc: "เพิ่มทีมงานได้ไม่จำกัด กำหนดสิทธิ์แยกตามบทบาท เจ้าของ, ปฏิบัติการ, ฝ่ายขาย, คลังสินค้า",
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            ครบทุกอย่างที่โรงคั่วต้องการ
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            สร้างจาก workflow จริงของโรงคั่วกาแฟไทย ไม่ใช่แค่ซอฟต์แวร์ทั่วไปที่ดัดแปลงมาใช้
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-primary/5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
