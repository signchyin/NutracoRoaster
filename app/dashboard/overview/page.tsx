import { getDashboardOverview } from '@/app/actions/dashboard'
import OverviewClient from './overview-client'

export default async function OverviewPage() {
  const data = await getDashboardOverview('month')
  return <OverviewClient initialData={data} initialPeriod="month" />
}
