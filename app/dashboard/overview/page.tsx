import { LayoutGrid } from 'lucide-react'
import { ComingSoon } from '@/components/dashboard/coming-soon'

export default function OverviewPage() {
  return (
    <ComingSoon
      icon={<LayoutGrid className="h-7 w-7" />}
      title="ภาพรวม"
      description="สรุปยอดขาย สต็อก และคิวการผลิตของโรงคั่ว"
    />
  )
}
