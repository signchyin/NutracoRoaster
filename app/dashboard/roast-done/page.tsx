import { CheckSquare } from 'lucide-react'
import { ComingSoon } from '@/components/dashboard/coming-soon'

export default function RoastDonePage() {
  return (
    <ComingSoon
      icon={<CheckSquare className="h-7 w-7" />}
      title="กาแฟคั่วสำเร็จ"
      description="รายการกาแฟที่คั่วเสร็จแล้วพร้อมน้ำหนักและโปรไฟล์การคั่ว"
    />
  )
}
