import VehicleForm from '@/components/VehicleForm'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditVehiclePage({ params }: PageProps) {
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

    return (
        <div className="bg-white shadow sm:rounded-lg p-6">
            <VehicleForm vehicle={vehicle} />
        </div>
    )
}
