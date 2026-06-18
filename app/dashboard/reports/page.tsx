import { BarChart3 } from 'lucide-react'
import { ComingSoon } from '@/components/dashboard/coming-soon'

export default function ReportsPage() {
  return (
    <ComingSoon
      icon={<BarChart3 className="h-7 w-7" />}
      title="รายงานและสรุปผล"
      description="ดูยอดขาย ปริมาณการคั่ว และแนวโน้มธุรกิจแบบเรียลไทม์ในที่เดียว"
    />
  )
}
