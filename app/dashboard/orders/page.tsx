import { ShoppingCart } from 'lucide-react'
import { ComingSoon } from '@/components/dashboard/coming-soon'

export default function OrdersPage() {
  return (
    <ComingSoon
      icon={<ShoppingCart className="h-7 w-7" />}
      title="จัดการออเดอร์"
      description="รับและติดตามออเดอร์ B2B และ B2C เชื่อมกับคิวคั่วในปฏิทินอัตโนมัติ"
    />
  )
}
