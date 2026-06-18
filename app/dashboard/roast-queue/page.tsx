import { getRoastBatches } from '@/app/actions/roast-batches'
import RoastQueueClient from './roast-queue-client'

export default async function RoastQueuePage() {
  const batches = await getRoastBatches()
  return <RoastQueueClient batches={batches} />
}
