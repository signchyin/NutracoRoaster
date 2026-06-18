import Image from "next/image"
import { Check } from "lucide-react"
import { BrowserFrame } from "@/components/browser-frame"

const sections = [
  {
    eyebrow: "ออเดอร์ & ลูกค้า",
    title: "ไม่มีออเดอร์ตกหล่นอีกต่อไป",
    desc: "รับออเดอร์จากทั้ง B2B (ร้านกาแฟ โรงแรม) และ B2C (ลูกค้าออนไลน์) ในหน้าเดียว ติดตามสถานะแบบ real-time ตั้งแต่รับออเดอร์ จนถึงจัดส่ง",
    points: ["แยกหน้า B2B / B2C ชัดเจน", "ติดตามสถานะทุกขั้นตอน", "ดูประวัติลูกค้าย้อนหลังได้ทันที"],
    image: "/screens/orders.png",
    alt: "หน้าจอระบบออเดอร์ Roastery แสดงรายการออเดอร์ B2B และ B2C พร้อม status badge",
    url: "app.roastery.co/orders",
  },
  {
    eyebrow: "คิวคั่ว",
    title: "วางแผนคั่วโดยไม่ต้องเดาว่าต้องคั่วอะไร",
    desc: "Kanban board เชื่อมกับออเดอร์ที่รอส่งโดยตรง รู้ทันทีว่าวันนี้ต้องคั่วกี่กก. อะไรบ้าง ไม่ต้องนั่งนับเองจาก Excel หรือ LINE",
    points: ["เชื่อมออเดอร์ → คิวคั่วอัตโนมัติ", "บันทึกแบตช์ กก. และสูตรคั่ว", "วางตารางล่วงหน้าได้หลายวัน"],
    image: "/screens/kanban.png",
    alt: "Kanban board คิวคั่วกาแฟ Roastery แสดงแบตช์การคั่วในแต่ละสถานะ",
    url: "app.roastery.co/roast-queue",
  },
  {
    eyebrow: "ปฏิทินทีม",
    title: "ทุกคนในทีมเห็นภาพรวมตรงกัน",
    desc: "ปฏิทินรวมออเดอร์ที่ต้องส่ง คิวคั่ว และวันครบกำหนดชำระใบแจ้งหนี้ไว้ในที่เดียว ทีมงานทุกคนเห็นตรงกัน ไม่ต้องส่งข้อความใน LINE กลุ่มซ้ำๆ",
    points: ["รวมทุก event จากทุกโมดูล", "กรองตามหมวดหมู่ B2B / B2C / คั่ว", "เพิ่มกิจกรรมเองได้"],
    image: "/screens/calendar.png",
    alt: "ปฏิทินทีม Roastery แสดงออเดอร์ คิวคั่ว และครบกำหนดชำระในมุมมองรายเดือน",
    url: "app.roastery.co/calendar",
  },
]

export function FeatureShowcase() {
  return (
    <section className="bg-card">
      <div className="mx-auto max-w-6xl space-y-20 px-4 py-20 sm:px-6 lg:space-y-28">
        {sections.map((s, i) => {
          const reversed = i % 2 === 1
          return (
            <div
              key={s.title}
              className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <div className={reversed ? "lg:order-2" : ""}>
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                  {s.eyebrow}
                </span>
                <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                  {s.title}
                </h2>
                <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
                <ul className="mt-6 space-y-3">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-center gap-3 text-sm font-medium">
                      <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3 w-3" aria-hidden="true" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={reversed ? "lg:order-1" : ""}>
                <BrowserFrame url={s.url}>
                  <Image
                    src={s.image || "/placeholder.svg"}
                    alt={s.alt}
                    width={1400}
                    height={900}
                    className="w-full"
                  />
                </BrowserFrame>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
