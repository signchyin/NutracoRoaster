import { Package } from 'lucide-react'
import { ComingSoon } from '@/components/dashboard/coming-soon'

export default function InventoryPage() {
  return (
    <ComingSoon
      icon={<Package className="h-7 w-7" />}
      title="สต็อกเมล็ดกาแฟ"
      description="ติดตามสต็อกเมล็ดดิบและกาแฟคั่ว แจ้งเตือนเมื่อใกล้หมดและคำนวณต้นทุน"
    />
  )
}
