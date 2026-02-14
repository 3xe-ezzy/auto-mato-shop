import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import VehicleDetails from '@/components/VehicleDetails'

export default async function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const vehicle = await prisma.vehicle.findUnique({
        where: { id },
        include: {
            images: {
                orderBy: { sortOrder: 'asc' }
            },
            equipment: true
        }
    })

    if (!vehicle) {
        notFound()
    }

    return <VehicleDetails vehicle={vehicle} />
}
