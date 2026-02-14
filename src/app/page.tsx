import { prisma } from '@/lib/prisma'
import ShopPage from '@/components/ShopPage'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'Available' },
    include: { images: true }
  })

  return (
    <ShopPage vehicles={vehicles} />
  )
}
