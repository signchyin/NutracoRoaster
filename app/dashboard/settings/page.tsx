import { getTenant, getTeamMembers, getRolePermissions } from '@/app/actions/settings'
import SettingsClient from './settings-client'

export default async function SettingsPage() {
  const [tenant, teamMembers, permissions] = await Promise.all([
    getTenant(),
    getTeamMembers(),
    getRolePermissions(),
  ])

  return (
    <SettingsClient
      tenant={tenant ?? null}
      teamMembers={teamMembers}
      permissions={permissions}
    />
  )
}
