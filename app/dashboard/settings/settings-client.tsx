'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { updateTenant, toggleTeamMemberActive, deleteTeamMember, upsertRolePermission } from '@/app/actions/settings'
import type { Tenant, TenantUser } from '@/lib/db/schema'

type Permission = {
  id: string
  tenant_id: string
  role: 'sales' | 'operations' | 'finance' | 'viewer'
  dashboard: boolean
  orders: boolean
  customers: boolean
  incentives: boolean
  roast_queue: boolean
  products: boolean
  inventory: boolean
  roasted_inventory: boolean
  invoices: boolean
  calendar: boolean
  updated_at: Date
}

type Props = {
  tenant: Tenant | null
  teamMembers: TenantUser[]
  permissions: Permission[]
}

const TABS = ['โปรไฟล์บริษัท', 'ตั้งค่าระบบ', 'ทีมงาน', 'สิทธิ์การใช้งาน']
const ROLES: Array<Permission['role']> = ['sales', 'operations', 'finance', 'viewer']
const ROLE_LABEL: Record<string, string> = {
  sales: 'Sales', operations: 'Operations', finance: 'Finance', viewer: 'Viewer',
}
const PAGES: Array<{ key: keyof Omit<Permission, 'id' | 'tenant_id' | 'role' | 'updated_at'>; label: string }> = [
  { key: 'dashboard', label: 'ภาพรวม' },
  { key: 'orders', label: 'รายการสั่งซื้อ' },
  { key: 'customers', label: 'ลูกค้า' },
  { key: 'incentives', label: 'ค่าตอบแทน' },
  { key: 'roast_queue', label: 'คิวการคั่ว' },
  { key: 'products', label: 'สินค้า' },
  { key: 'inventory', label: 'สารกาแฟ LOT' },
  { key: 'roasted_inventory', label: 'กาแฟคั่วสำเร็จ' },
  { key: 'invoices', label: 'ใบกำกับภาษี' },
  { key: 'calendar', label: 'ปฏิทิน' },
]

export default function SettingsClient({ tenant, teamMembers, permissions }: Props) {
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [pending, startTransition] = useTransition()

  // Profile form state
  const [name, setName] = useState(tenant?.name ?? '')
  const [nameEn, setNameEn] = useState(tenant?.name_en ?? '')
  const [taxId, setTaxId] = useState(tenant?.tax_id ?? '')
  const [address, setAddress] = useState(tenant?.address ?? '')

  // System config state
  const [vatRate, setVatRate] = useState(String(Number(tenant?.vat_rate ?? 0.07) * 100))
  const [invoicePrefix, setInvoicePrefix] = useState(tenant?.invoice_prefix ?? 'INV')
  const [quotationPrefix, setQuotationPrefix] = useState(tenant?.quotation_prefix ?? 'QT')
  const [receiptPrefix, setReceiptPrefix] = useState(tenant?.receipt_prefix ?? 'REC')
  const [promptpayId, setPromptpayId] = useState(tenant?.promptpay_id ?? '')

  function saveProfile() {
    startTransition(() =>
      updateTenant({ name, name_en: nameEn, tax_id: taxId, address })
    )
  }

  function saveSystem() {
    startTransition(() =>
      updateTenant({
        vat_rate: Number(vatRate) / 100,
        invoice_prefix: invoicePrefix,
        quotation_prefix: quotationPrefix,
        receipt_prefix: receiptPrefix,
        promptpay_id: promptpayId,
      })
    )
  }

  function toggleMember(id: string, current: boolean) {
    startTransition(() => toggleTeamMemberActive(id, !current))
  }

  function removeMember(id: string) {
    if (!confirm('ลบสมาชิกนี้?')) return
    startTransition(() => deleteTeamMember(id))
  }

  function togglePermission(role: Permission['role'], page: string, current: boolean) {
    startTransition(() => upsertRolePermission(role, page, !current))
  }

  // Build a permission lookup map
  const permMap: Record<string, Record<string, boolean>> = {}
  for (const role of ROLES) {
    permMap[role] = {}
    const row = permissions.find((p) => p.role === role)
    for (const page of PAGES) {
      permMap[role][page.key] = row ? (row[page.key] as boolean) : false
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold leading-tight">ตั้งค่าระบบ</h1>
        <p className="text-sm text-muted-foreground">Settings</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- TAB: โปรไฟล์บริษัท --- */}
      {activeTab === 'โปรไฟล์บริษัท' && (
        <div className="max-w-xl space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-sm">ข้อมูลบริษัท</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">ชื่อบริษัท (ไทย)</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">ชื่อบริษัท (อังกฤษ)</label>
                <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">เลขผู้เสียภาษี</label>
                <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">ที่อยู่สำหรับเอกสาร</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <Button size="sm" onClick={saveProfile} disabled={pending}>บันทึก</Button>
          </div>
        </div>
      )}

      {/* --- TAB: ตั้งค่าระบบ --- */}
      {activeTab === 'ตั้งค่าระบบ' && (
        <div className="max-w-xl space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-sm">การเงิน</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">VAT (%)</label>
                <Input type="number" value={vatRate} onChange={(e) => setVatRate(e.target.value)} step="0.1" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">PromptPay ID</label>
                <Input value={promptpayId} onChange={(e) => setPromptpayId(e.target.value)} />
              </div>
            </div>
            <h2 className="font-semibold text-sm pt-2">Prefix เอกสาร</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">ใบแจ้งหนี้</label>
                <Input value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">ใบเสนอราคา</label>
                <Input value={quotationPrefix} onChange={(e) => setQuotationPrefix(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">ใบเสร็จ</label>
                <Input value={receiptPrefix} onChange={(e) => setReceiptPrefix(e.target.value)} />
              </div>
            </div>
            <Button size="sm" onClick={saveSystem} disabled={pending}>บันทึก</Button>
          </div>
        </div>
      )}

      {/* --- TAB: ทีมงาน --- */}
      {activeTab === 'ทีมงาน' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">Username</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">ชื่อ</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">บทบาท</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">สถานะ</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {teamMembers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      ยังไม่มีสมาชิกทีม
                    </td>
                  </tr>
                )}
                {teamMembers.map((member) => (
                  <tr key={member.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{member.username}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{member.full_name}</p>
                      {member.nickname && <p className="text-xs text-muted-foreground">{member.nickname}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
                        {ROLE_LABEL[member.role] ?? member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', member.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                        {member.is_active ? 'Active' : 'ปิดใช้งาน'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">แก้ไข</Button>
                        <Button variant="outline" size="sm" disabled={pending} onClick={() => toggleMember(member.id, member.is_active)} className="h-7 text-xs px-2.5">
                          {member.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                        </Button>
                        <Button variant="ghost" size="sm" disabled={pending} onClick={() => removeMember(member.id)} className="h-7 text-xs px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10">
                          ลบ
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5">+ เพิ่มสมาชิก</Button>
        </div>
      )}

      {/* --- TAB: สิทธิ์การใช้งาน --- */}
      {activeTab === 'สิทธิ์การใช้งาน' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">หน้า</th>
                {ROLES.map((role) => (
                  <th key={role} className="px-4 py-3 text-center font-medium text-muted-foreground text-xs">
                    {ROLE_LABEL[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAGES.map((page) => (
                <tr key={page.key} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 text-sm">{page.label}</td>
                  {ROLES.map((role) => {
                    const allowed = permMap[role][page.key] ?? false
                    return (
                      <td key={role} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={allowed}
                          disabled={pending}
                          onChange={() => togglePermission(role, page.key, allowed)}
                          className="h-4 w-4 rounded accent-primary cursor-pointer"
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
