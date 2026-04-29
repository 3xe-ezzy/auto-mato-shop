import { prisma } from '@/lib/prisma'
import ShopPage from '@/components/ShopPage'

export const dynamic = 'force-dynamic'

export default async function VehiclesHome() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: { in: ['Available', 'Reserved', 'Sold'] } },
    include: { 
      images: {
        orderBy: { sortOrder: 'asc' }
      } 
    }
  })

  return (
    <ShopPage vehicles={vehicles} />
  )
}
