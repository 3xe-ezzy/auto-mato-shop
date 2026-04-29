import { prisma } from '@/lib/prisma'
import AdminDashboard from '@/components/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const vehicles = await prisma.vehicle.findMany({
        orderBy: { createdAt: 'desc' },
        include: { 
            images: {
                orderBy: { sortOrder: 'asc' }
            },
            VehicleListing: true
        }
    })

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <AdminDashboard vehicles={vehicles} />
        </div>
    )
}
