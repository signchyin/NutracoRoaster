import { getOrders } from '@/app/actions/orders'
import { getRoastedInventory } from '@/app/actions/roasted-inventory'
import { getProducts } from '@/app/actions/products'
import PackingClient from './packing-client'

export default async function PackingPage() {
  const [allOrders, roastedStock, products] = await Promise.all([
    getOrders(),
    getRoastedInventory(),
    getProducts(),
  ])

  const packingOrders = allOrders.filter(
    (o) => o.status === 'in_production' || o.status === 'ready',
  )

  return (
    <PackingClient
      orders={packingOrders}
      roastedStock={roastedStock}
      products={products}
    />
  )
}
