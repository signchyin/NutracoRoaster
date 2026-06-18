import { getTenant, getTeamMembers, getRolePermissions } from '@/app/actions/settings'
import SettingsClient from './settings-client'

export default async function SettingsPage() {
  const [tenant, teamMembers, permissions] = await Promise.all([
    getTenant(),
    getTeamMembers(),
    getRolePermissions(),
  ])

  type EditableRole = 'sales' | 'operations' | 'finance' | 'viewer'
  const editablePerms = permissions.filter(
    (p): p is typeof p & { role: EditableRole } =>
      (p.role as string) !== 'owner',
  )

  return (
    <SettingsClient
      tenant={tenant ?? null}
      teamMembers={teamMembers}
      permissions={editablePerms}
    />
  )
}
