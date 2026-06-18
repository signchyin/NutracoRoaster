import { Coffee } from 'lucide-react'
import { ComingSoon } from '@/components/dashboard/coming-soon'

export default function ProductsPage() {
  return (
    <ComingSoon
      icon={<Coffee className="h-7 w-7" />}
      title="สินค้า"
      description="จัดการรายการสินค้ากาแฟ ราคา และรายละเอียดต่าง ๆ"
    />
  )
}
