import { Users } from 'lucide-react'
import { ComingSoon } from '@/components/dashboard/coming-soon'

export default function CustomersPage() {
  return (
    <ComingSoon
      icon={<Users className="h-7 w-7" />}
      title="ฐานข้อมูลลูกค้า"
      description="เก็บข้อมูลร้านกาแฟและลูกค้าประจำ ดูประวัติการสั่งซื้อและความชอบการคั่ว"
    />
  )
}
