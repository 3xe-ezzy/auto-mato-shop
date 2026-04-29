'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { syncVehicleToPortals } from '@/lib/portals/sync-service'
import { z } from 'zod'
import { uploadImage } from '@/lib/upload'
import { del } from '@vercel/blob'

const VehicleSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
    mileage: z.coerce.number().min(0),
    price: z.coerce.number().min(0),
    condition: z.string().min(1),
    status: z.string().min(1),
    description: z.string().optional(),
    descriptionEn: z.string().optional(),
    fuelType: z.string().optional(),
    transmission: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    equipment: z.string().optional(),
    vin: z.string().optional(),
    power: z.coerce.number().optional().nullable(),
    engineCapacity: z.coerce.number().optional().nullable(),
    doors: z.coerce.number().optional().nullable(),
    seats: z.coerce.number().optional().nullable(),
    emissionClass: z.string().optional().nullable(),
    exteriorColor: z.string().optional().nullable(),
    interiorType: z.string().optional().nullable(),
    interiorColor: z.string().optional().nullable(),
    owners: z.coerce.number().optional().nullable(),
    nonSmoker: z.preprocess((val) => val === 'on' || val === 'true', z.boolean()).optional().default(false),
    fullServiceHistory: z.preprocess((val) => val === 'on' || val === 'true', z.boolean()).optional().default(false),
    syncAutoScout24: z.preprocess((val) => val === 'on' || val === 'true', z.boolean()).optional().default(false),
    syncMobileDe: z.preprocess((val) => val === 'on' || val === 'true', z.boolean()).optional().default(false),
    syncEbay: z.preprocess((val) => val === 'on' || val === 'true', z.boolean()).optional().default(false),
    syncKleinanzeigen: z.preprocess((val) => val === 'on' || val === 'true', z.boolean()).optional().default(false),
})

export async function createVehicle(formData: FormData) {
    const rawData = {
        make: formData.get('make'),
        model: formData.get('model'),
        year: formData.get('year'),
        mileage: formData.get('mileage'),
        price: formData.get('price'),
        condition: formData.get('condition'),
        status: formData.get('status'),
        description: formData.get('description'),
        descriptionEn: formData.get('descriptionEn'),
        fuelType: formData.get('fuelType'),
        transmission: formData.get('transmission'),
        equipment: formData.get('equipment'),
        vin: formData.get('vin'),
        power: formData.get('power'),
        engineCapacity: formData.get('engineCapacity'),
        doors: formData.get('doors'),
        seats: formData.get('seats'),
        emissionClass: formData.get('emissionClass'),
        exteriorColor: formData.get('exteriorColor'),
        interiorType: formData.get('interiorType'),
        interiorColor: formData.get('interiorColor'),
        owners: formData.get('owners'),
        nonSmoker: formData.get('nonSmoker'),
        fullServiceHistory: formData.get('fullServiceHistory'),
        syncAutoScout24: formData.get('syncAutoScout24'),
        syncMobileDe: formData.get('syncMobileDe'),
        syncEbay: formData.get('syncEbay'),
        syncKleinanzeigen: formData.get('syncKleinanzeigen'),
    }

    const validatedFields = VehicleSchema.omit({ imageUrl: true }).safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { equipment, ...vehicleData } = validatedFields.data

    // Generate Article Number
    const prefix = vehicleData.make.substring(0, 3).toLowerCase()
    const modelStr = vehicleData.model.toLowerCase().replace(/\s+/g, '-')
    const yearStr = new Date().getFullYear()
    const baseArticleNumber = `${prefix}-${modelStr}-${yearStr}`

    const existingVehicles = await prisma.vehicle.findMany({
        select: {
            articleNumber: true
        }
    })

    let maxSequence = 0
    existingVehicles.forEach(v => {
        if (v.articleNumber) {
            const parts = v.articleNumber.split('-')
            const seq = parseInt(parts[parts.length - 1])
            if (!isNaN(seq) && seq > maxSequence) {
                maxSequence = seq
            }
        }
    })

    const articleNumber = `${baseArticleNumber}-${maxSequence + 1}`

    try {
        const imageOrderRaw = formData.get('imageOrder') as string
        const imageOrder = imageOrderRaw ? JSON.parse(imageOrderRaw) : []
        
        const vehicle = await prisma.vehicle.create({
            data: {
                ...vehicleData,
                articleNumber,
                images: {
                    create: imageOrder.map((url: string, index: number) => ({
                        url,
                        sortOrder: index + 1
                    }))
                },
                equipment: equipment ? {
                    create: equipment.split(',').map(e => ({ name: e.trim() })).filter(e => e.name)
                } : undefined
            }
        })

        // Trigger Sync
        await syncVehicleToPortals(vehicle.id);
    } catch (error) {
        console.error('Database Error:', error)
        return {
            message: 'Database Error: Failed to create vehicle.',
        }
    }

    revalidatePath('/admin')
    revalidatePath('/')
    redirect('/admin')
}

export async function updateVehicle(id: string, formData: FormData) {
    const rawData = {
        make: formData.get('make'),
        model: formData.get('model'),
        year: formData.get('year'),
        mileage: formData.get('mileage'),
        price: formData.get('price'),
        condition: formData.get('condition'),
        status: formData.get('status'),
        description: formData.get('description'),
        descriptionEn: formData.get('descriptionEn'),
        fuelType: formData.get('fuelType'),
        transmission: formData.get('transmission'),
        equipment: formData.get('equipment'),
        vin: formData.get('vin'),
        power: formData.get('power'),
        engineCapacity: formData.get('engineCapacity'),
        doors: formData.get('doors'),
        seats: formData.get('seats'),
        emissionClass: formData.get('emissionClass'),
        exteriorColor: formData.get('exteriorColor'),
        interiorType: formData.get('interiorType'),
        interiorColor: formData.get('interiorColor'),
        owners: formData.get('owners'),
        nonSmoker: formData.get('nonSmoker'),
        fullServiceHistory: formData.get('fullServiceHistory'),
        syncAutoScout24: formData.get('syncAutoScout24'),
        syncMobileDe: formData.get('syncMobileDe'),
        syncEbay: formData.get('syncEbay'),
        syncKleinanzeigen: formData.get('syncKleinanzeigen'),
    }

    const validatedFields = VehicleSchema.omit({ imageUrl: true }).safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { equipment, ...vehicleData } = validatedFields.data

    try {
        // Update basic info
        await prisma.vehicle.update({
            where: { id },
            data: vehicleData,
        })

        // Handle image order
        const imageOrderRaw = formData.get('imageOrder') as string
        const imageOrder = imageOrderRaw ? JSON.parse(imageOrderRaw) : []
        
        for (let i = 0; i < imageOrder.length; i++) {
            const item = imageOrder[i]; // Can be an existing ID or a new URL
            const sortOrder = i + 1;

            if (item.startsWith('http')) {
                // This is a new image URL from client-side upload
                await prisma.image.create({
                    data: {
                        url: item,
                        vehicleId: id,
                        sortOrder: sortOrder
                    }
                })
            } else {
                // This is an existing image, update its sort order
                await prisma.image.update({
                    where: { id: item },
                    data: { sortOrder: sortOrder }
                })
            }
        }

        // Handle equipment update
        if (equipment !== undefined) {
            await prisma.equipment.deleteMany({ where: { vehicleId: id } })
            if (equipment.length > 0) {
                await prisma.equipment.createMany({
                    data: equipment.split(',').map(e => ({ name: e.trim(), vehicleId: id })).filter(e => e.name)
                })
            }
        }

        // Trigger Sync
        await syncVehicleToPortals(id);

    } catch (error) {
        console.error('Database Error:', error)
        return {
            message: 'Database Error: Failed to update vehicle.',
        }
    }

    revalidatePath('/admin')
    revalidatePath('/')
    redirect('/admin')
}

export async function deleteVehicle(id: string) {
    try {
        // Also delete images from filesystem
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
            include: { images: true }
        })

        if (vehicle) {
            for (const image of vehicle.images) {
                try {
                    await del(image.url)
                } catch (e) {
                    console.error('Failed to delete blob', image.url, e)
                }
            }
        }

        await prisma.vehicle.delete({
            where: { id },
        })
        revalidatePath('/admin')
        revalidatePath('/')
        return { message: 'Deleted Vehicle' }
    } catch (error) {
        return { message: 'Database Error: Failed to delete vehicle.' }
    }
}

export async function deleteImage(imageId: string) {
    try {
        const image = await prisma.image.findUnique({
            where: { id: imageId }
        })

        if (!image) {
            return { message: 'Image not found' }
        }

        // Delete from Vercel Blob
        try {
            await del(image.url)
        } catch (e) {
            console.error('Failed to delete blob', image.url, e)
        }

        // Delete from database
        await prisma.image.delete({
            where: { id: imageId }
        })

        revalidatePath('/admin')
        revalidatePath('/')
        return { message: 'Deleted Image' }
    } catch (error) {
        console.error('Database Error:', error)
        return { message: 'Database Error: Failed to delete image.' }
    }
}
