import { Flame } from 'lucide-react'
import { ComingSoon } from '@/components/dashboard/coming-soon'

export default function RoastQueuePage() {
  return (
    <ComingSoon
      icon={<Flame className="h-7 w-7" />}
      title="คิวการคั่ว"
      description="ดูและจัดการคิวการคั่วกาแฟทั้งหมดพร้อมสถานะแบบเรียลไทม์"
    />
  )
}
