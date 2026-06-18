import { getGreenBeanLots } from '@/app/actions/inventory'
import InventoryClient from './inventory-client'

export default async function InventoryPage() {
  const lots = await getGreenBeanLots()
  return <InventoryClient lots={lots} />
}
