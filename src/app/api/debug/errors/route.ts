import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const errors = await prisma.vehicleListing.findMany({
            where: { status: 'FAILED' },
            include: { vehicle: { select: { make: true, model: true, id: true } } },
            orderBy: { lastSync: 'desc' }
        })
        
        return NextResponse.json(errors)
    } catch (e: any) {
        return NextResponse.json({ error: e.message })
    }
}
