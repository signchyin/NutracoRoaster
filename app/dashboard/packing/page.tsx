import { Archive } from 'lucide-react'
import { ComingSoon } from '@/components/dashboard/coming-soon'

export default function PackingPage() {
  return (
    <ComingSoon
      icon={<Archive className="h-7 w-7" />}
      title="กิมแพ็คสินค้า"
      description="จัดการการแพ็คและจัดส่งสินค้าให้กับลูกค้า"
    />
  )
}
