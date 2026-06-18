import { Settings } from 'lucide-react'
import { ComingSoon } from '@/components/dashboard/coming-soon'

export default function SettingsPage() {
  return (
    <ComingSoon
      icon={<Settings className="h-7 w-7" />}
      title="ตั้งค่าระบบ"
      description="จัดการการตั้งค่าทั่วไป ผู้ใช้งาน และการเชื่อมต่อต่าง ๆ"
    />
  )
}
