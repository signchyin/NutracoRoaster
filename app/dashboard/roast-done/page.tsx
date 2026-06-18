import { getRoastedInventory } from '@/app/actions/roasted-inventory'
import RoastDoneClient from './roast-done-client'

export default async function RoastDonePage() {
  const items = await getRoastedInventory()
  return <RoastDoneClient items={items} />
}
