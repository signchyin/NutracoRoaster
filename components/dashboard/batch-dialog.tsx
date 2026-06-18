'use client'

import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RoastBatch } from '@/app/actions/roast-batches'

export type BatchValues = {
  title: string
  beanOrigin: string
  roastLevel: string
  quantityKg: number
  status: string
  scheduledDate: string
  startTime: string
  notes: string
}

const ROAST_LEVELS = [
  { value: 'light', label: 'คั่วอ่อน (Light)' },
  { value: 'medium', label: 'คั่วกลาง (Medium)' },
  { value: 'medium-dark', label: 'คั่วกลางเข้ม (Medium-Dark)' },
  { value: 'dark', label: 'คั่วเข้ม (Dark)' },
]
const STATUSES = [
  { value: 'queued', label: 'รอคั่ว' },
  { value: 'roasting', label: 'กำลังคั่ว' },
  { value: 'cooling', label: 'ทำเย็น' },
  { value: 'packing', label: 'บรรจุภัณฑ์' },
  { value: 'ready', label: 'พร้อมส่ง' },
  { value: 'complete', label: 'เสร็จสมบูรณ์' },
]

function emptyValues(date: string): BatchValues {
  return {
    title: '',
    beanOrigin: '',
    roastLevel: 'medium',
    quantityKg: 0,
    status: 'queued',
    scheduledDate: date,
    startTime: '',
    notes: '',
  }
}

export function BatchDialog({
  open,
  onOpenChange,
  editing,
  presetDate,
  onSave,
  onDelete,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: RoastBatch | null
  presetDate: string
  onSave: (values: BatchValues, id?: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [values, setValues] = useState<BatchValues>(emptyValues(presetDate))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setValues({
        title: editing.title,
        beanOrigin: editing.beanOrigin,
        roastLevel: editing.roastLevel,
        quantityKg: editing.quantityKg,
        status: editing.status,
        scheduledDate: editing.scheduledDate ?? '',
        startTime: editing.startTime ?? '',
        notes: editing.notes ?? '',
      })
    } else {
      setValues(emptyValues(presetDate))
    }
  }, [open, editing, presetDate])

  function set<K extends keyof BatchValues>(key: K, val: BatchValues[K]) {
    setValues((v) => ({ ...v, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(values, editing?.id)
    setSaving(false)
    onOpenChange(false)
  }

  async function handleDelete() {
    if (!editing) return
    setSaving(true)
    await onDelete(editing.id)
    setSaving(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'แก้ไขคิวคั่ว' : 'จองคิวคั่วใหม่'}</DialogTitle>
          <DialogDescription>
            กำหนดรายละเอียดการคั่วกาแฟสำหรับวันที่เลือก
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">ชื่อแบตช์</Label>
            <Input
              id="title"
              required
              placeholder="เช่น Ethiopia Yirgacheffe Lot 4"
              value={values.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="beanOrigin">แหล่งที่มาเมล็ด</Label>
            <Input
              id="beanOrigin"
              placeholder="เช่น ดอยช้าง, เชียงราย"
              value={values.beanOrigin}
              onChange={(e) => set('beanOrigin', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="quantityKg">ปริมาณ (กก.)</Label>
              <Input
                id="quantityKg"
                type="number"
                min={0}
                value={values.quantityKg}
                onChange={(e) => set('quantityKg', Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="startTime">เวลาเริ่ม</Label>
              <Input
                id="startTime"
                type="time"
                value={values.startTime}
                onChange={(e) => set('startTime', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>ระดับการคั่ว</Label>
              <Select value={values.roastLevel} onValueChange={(v) => setValues((prev) => ({ ...prev, roastLevel: v ?? prev.roastLevel }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROAST_LEVELS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>สถานะ</Label>
              <Select value={values.status} onValueChange={(v) => setValues((prev) => ({ ...prev, status: v ?? prev.status }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="scheduledDate">วันที่คั่ว</Label>
            <Input
              id="scheduledDate"
              type="date"
              required
              value={values.scheduledDate}
              onChange={(e) => set('scheduledDate', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">บันทึกเพิ่มเติม</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="โปรไฟล์การคั่ว, ลูกค้า, หมายเหตุ..."
              value={values.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
            {editing ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={saving}
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                ลบ
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'จองคิว'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
