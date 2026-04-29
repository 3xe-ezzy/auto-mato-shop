'use client'

import { createVehicle, updateVehicle } from '@/app/actions'
import { Vehicle, Image, Equipment } from '@prisma/client'
import { carData } from '@/lib/car-data'
import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/components/LanguageContext'
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable'
import { SortableImage } from './SortableImage'
import { upload } from '@vercel/blob/client'
import { ImageEditor } from './ImageEditor'

type VehicleWithRelations = Vehicle & {
    images: Image[]
    equipment: Equipment[]
    vin?: string | null
    power?: number | null
    engineCapacity?: number | null
    doors?: number | null
    seats?: number | null
    emissionClass?: string | null
    exteriorColor?: string | null
    interiorType?: string | null
    interiorColor?: string | null
    owners?: number | null
    nonSmoker?: boolean
    fullServiceHistory?: boolean
    syncAutoScout24?: boolean
    syncMobileDe?: boolean
    syncEbay?: boolean
    syncKleinanzeigen?: boolean
}

type UnifiedImage = {
    id: string
    url: string
    file?: File
    isExisting: boolean
    isUploading?: boolean
}

export default function VehicleForm({ vehicle }: { vehicle?: VehicleWithRelations }) {
    const { t } = useLanguage()
    const isEdit = !!vehicle
    const baseAction = isEdit ? updateVehicle.bind(null, vehicle.id) : createVehicle

    const [selectedMake, setSelectedMake] = useState<string>(vehicle?.make || '')
    const [images, setImages] = useState<UnifiedImage[]>(() => {
        if (vehicle?.images) {
            return vehicle.images
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map(img => ({
                    id: img.id,
                    url: img.url,
                    isExisting: true
                }))
        }
        return []
    })
    
    const [isDragging, setIsDragging] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingImage, setEditingImage] = useState<UnifiedImage | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Cleanup previews
    useEffect(() => {
        return () => {
            images.forEach(img => {
                if (!img.isExisting) {
                    URL.revokeObjectURL(img.url)
                }
            })
        }
    }, [])

    const addFiles = async (files: FileList | File[]) => {
        const newFiles = Array.from(files).map(file => {
            // Normalize .jfif files – they are JPEG but browsers may send wrong MIME type
            if (file.name.toLowerCase().endsWith('.jfif') || file.type === 'image/jfif' || file.type === 'image/pjpeg') {
                return new File([file], file.name.replace(/\.jfif$/i, '.jpg'), { type: 'image/jpeg' })
            }
            return file
        })
        
        // Add placeholders
        const placeholders: UnifiedImage[] = newFiles.map(file => ({
            id: `uploading-${Date.now()}-${Math.random()}`,
            url: URL.createObjectURL(file),
            file,
            isExisting: false,
            isUploading: true
        }))
        
        setImages(prev => [...prev, ...placeholders])

        // Upload each file
        for (let i = 0; i < placeholders.length; i++) {
            const placeholder = placeholders[i]
            const file = placeholder.file!

            try {
                const newBlob = await upload(file.name, file, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                })

                setImages(prev => prev.map(img => 
                    img.id === placeholder.id 
                    ? { ...img, url: newBlob.url, isUploading: false } 
                    : img
                ))
                
                // Cleanup local preview
                URL.revokeObjectURL(placeholder.url)
            } catch (error) {
                console.error('Upload failed:', error)
                alert(`Fehler beim Hochladen von ${file.name}`)
                setImages(prev => prev.filter(img => img.id !== placeholder.id))
            }
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            addFiles(e.target.files)
            e.target.value = ''
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files)
        }
    }
    
    const editFile = (id: string) => {
        const img = images.find(i => i.id === id)
        if (img) setEditingImage(img)
    }

    const handleSaveEditedImage = async (blob: Blob) => {
        if (!editingImage) return

        // Create a new File from the blob
        const file = new File([blob], `edited-${Date.now()}.jpg`, { type: 'image/jpeg' })
        
        // Mark the current image as uploading to show feedback
        setImages(prev => prev.map(img => 
            img.id === editingImage.id ? { ...img, isUploading: true } : img
        ))
        setEditingImage(null)

        try {
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/upload',
            })

            // Replace the old image with the new one
            setImages(prev => prev.map(img => 
                img.id === editingImage.id 
                ? { ...img, url: newBlob.url, isUploading: false, isExisting: false } 
                : img
            ))
        } catch (error) {
            console.error('Failed to upload edited image:', error)
            alert('Fehler beim Speichern des bearbeiteten Bildes.')
            setImages(prev => prev.map(img => 
                img.id === editingImage.id ? { ...img, isUploading: false } : img
            ))
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setImages((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id)
                const newIndex = items.findIndex(item => item.id === over.id)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const removeFile = async (id: string) => {
        const imgToRemove = images.find(img => img.id === id)
        if (!imgToRemove) return

        if (imgToRemove.isExisting) {
            if (confirm('Bist du sicher, dass du dieses Bild dauerhaft löschen möchtest?')) {
                const { deleteImage } = await import('@/app/actions')
                await deleteImage(id)
                setImages(prev => prev.filter(img => img.id !== id))
            }
        } else {
            URL.revokeObjectURL(imgToRemove.url)
            setImages(prev => prev.filter(img => img.id !== id))
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isSubmitting) return
        
        setIsSubmitting(true)
        try {
            const formData = new FormData(e.currentTarget)

            // Check if any images are still uploading
            if (images.some(img => img.isUploading)) {
                alert('Bitte warte, bis alle Bilder hochgeladen sind.')
                setIsSubmitting(false)
                return
            }

            // We no longer need to send 'images' files in the form data
            // because they are already in the cloud.
            // But we need to send the final order of URLs.
            const imageOrder = images.map(img => img.isExisting ? img.id : img.url)
            formData.append('imageOrder', JSON.stringify(imageOrder))

            const result = await baseAction(formData)
            if (result && (result as any).errors) {
                const errorMsg = Object.values((result as any).errors).flat().join('\n')
                alert(`Fehler beim Speichern:\n${errorMsg}`)
                setIsSubmitting(false)
            }
        } catch (error: any) {
            // Ignore NEXT_REDIRECT errors as they are expected on success
            if (error.message?.includes('NEXT_REDIRECT') || error.digest?.includes('NEXT_REDIRECT')) {
                return
            }
            console.error('Submit error:', error)
            alert('Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.')
            setIsSubmitting(false)
        }
    }

    const equipmentString = vehicle?.equipment?.map(e => e.name).join(', ') || ''
    const availableModels = selectedMake ? carData[selectedMake] || [] : []

    return (
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
            <div className="space-y-8 divide-y divide-gray-200">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-black">
                        {isEdit ? t.actions.edit : t.actions.addVehicle}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {t.messages.publicInfo}
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.make}
                            </label>
                            <div className="mt-1">
                                <select
                                    id="make"
                                    name="make"
                                    value={selectedMake}
                                    onChange={(e) => setSelectedMake(e.target.value)}
                                    required
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                >
                                    <option value="">Select a Make</option>
                                    {Object.keys(carData).map((make) => (
                                        <option key={make} value={make}>{make}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.model}
                            </label>
                            <div className="mt-1">
                                <select
                                    id="model"
                                    name="model"
                                    defaultValue={vehicle?.model}
                                    required
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                >
                                    <option value="">Select a Model</option>
                                    {availableModels.map((model) => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.year}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="year"
                                    id="year"
                                    defaultValue={vehicle?.year}
                                    required
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="mileage" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.mileage} (km)
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="mileage"
                                    id="mileage"
                                    defaultValue={vehicle?.mileage}
                                    required
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.price} (€)
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="price"
                                    id="price"
                                    defaultValue={vehicle?.price}
                                    required
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.condition}
                            </label>
                            <div className="mt-1">
                                <select
                                    id="condition"
                                    name="condition"
                                    defaultValue={vehicle?.condition || 'Used'}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                >
                                    <option value="New">{t.values.new}</option>
                                    <option value="Used">{t.values.used}</option>
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.status}
                            </label>
                            <div className="mt-1">
                                <select
                                    id="status"
                                    name="status"
                                    defaultValue={vehicle?.status || 'Available'}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                >
                                    <option value="Available">{t.values.available}</option>
                                    <option value="Sold">{t.values.sold}</option>
                                    <option value="Reserved">{t.values.reserved}</option>
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.fuelType}
                            </label>
                            <div className="mt-1">
                                <select
                                    id="fuelType"
                                    name="fuelType"
                                    defaultValue={vehicle?.fuelType || 'Petrol'}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                >
                                    <option value="Petrol">{t.values.petrol}</option>
                                    <option value="Diesel">{t.values.diesel}</option>
                                    <option value="Hybrid">{t.values.hybrid}</option>
                                    <option value="Electric">{t.values.electric}</option>
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.transmission}
                            </label>
                            <div className="mt-1">
                                <select
                                    id="transmission"
                                    name="transmission"
                                    defaultValue={vehicle?.transmission || 'Manual'}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                >
                                    <option value="Manual">{t.values.manual}</option>
                                    <option value="Automatic">{t.values.automatic}</option>
                                </select>
                            </div>
                        </div>

                        {/* Portal specific fields */}
                        <div className="sm:col-span-6 border-t border-gray-200 pt-6">
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Portal Details (Required for mobile.de / AutoScout24)</h4>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="vin" className="block text-sm font-medium text-gray-700">
                                VIN
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="vin"
                                    id="vin"
                                    defaultValue={vehicle?.vin || ''}
                                    placeholder="WBA..."
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="power" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.power}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="power"
                                    id="power"
                                    defaultValue={vehicle?.power || ''}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="engineCapacity" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.engineCapacity}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="engineCapacity"
                                    id="engineCapacity"
                                    defaultValue={vehicle?.engineCapacity || ''}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="doors" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.doors}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="doors"
                                    id="doors"
                                    defaultValue={vehicle?.doors || ''}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="seats" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.seats}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="seats"
                                    id="seats"
                                    defaultValue={vehicle?.seats || ''}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="emissionClass" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.emissionClass}
                            </label>
                            <div className="mt-1">
                                <select
                                    id="emissionClass"
                                    name="emissionClass"
                                    defaultValue={vehicle?.emissionClass || ''}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                >
                                    <option value="">Select</option>
                                    <option value="Euro 6">Euro 6</option>
                                    <option value="Euro 5">Euro 5</option>
                                    <option value="Euro 4">Euro 4</option>
                                    <option value="Euro 3">Euro 3</option>
                                    <option value="Euro 2">Euro 2</option>
                                    <option value="Euro 1">Euro 1</option>
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="exteriorColor" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.exteriorColor}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="exteriorColor"
                                    id="exteriorColor"
                                    defaultValue={vehicle?.exteriorColor || ''}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="interiorType" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.interiorType}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="interiorType"
                                    id="interiorType"
                                    defaultValue={vehicle?.interiorType || ''}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="interiorColor" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.interiorColor}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="interiorColor"
                                    id="interiorColor"
                                    defaultValue={vehicle?.interiorColor || ''}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="owners" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.owners}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="owners"
                                    id="owners"
                                    defaultValue={vehicle?.owners || ''}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3 flex items-center">
                            <input
                                id="nonSmoker"
                                name="nonSmoker"
                                type="checkbox"
                                defaultChecked={vehicle?.nonSmoker}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="nonSmoker" className="ml-2 block text-sm text-gray-900">
                                {t.vehicle.nonSmoker}
                            </label>
                        </div>

                        <div className="sm:col-span-3 flex items-center">
                            <input
                                id="fullServiceHistory"
                                name="fullServiceHistory"
                                type="checkbox"
                                defaultChecked={vehicle?.fullServiceHistory}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="fullServiceHistory" className="ml-2 block text-sm text-gray-900">
                                {t.vehicle.fullServiceHistory}
                            </label>
                        </div>

                        <div className="sm:col-span-6 border-t border-gray-100 mt-4 pt-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Portal-Export</h4>
                        </div>

                        <div className="sm:col-span-3 flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100 transition-all hover:bg-blue-100 group">
                            <input
                                id="syncAutoScout24"
                                name="syncAutoScout24"
                                type="checkbox"
                                defaultChecked={vehicle?.syncAutoScout24}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="syncAutoScout24" className="ml-3 block text-sm font-bold text-blue-900 cursor-pointer">
                                Zu AutoScout24 übertragen
                                <span className="block font-normal text-xs text-blue-600">Exportiert dieses Fahrzeug zu AS24</span>
                            </label>
                        </div>

                        <div className="sm:col-span-3 flex items-center p-4 bg-orange-50 rounded-lg border border-orange-100 transition-all hover:bg-orange-100 group">
                            <input
                                id="syncMobileDe"
                                name="syncMobileDe"
                                type="checkbox"
                                defaultChecked={vehicle?.syncMobileDe}
                                className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="syncMobileDe" className="ml-3 block text-sm font-bold text-orange-900 cursor-pointer">
                                Zu mobile.de übertragen
                                <span className="block font-normal text-xs text-orange-600">Exportiert dieses Fahrzeug zu mobile.de</span>
                            </label>
                        </div>

                        <div className="sm:col-span-3 flex items-center p-4 bg-green-50 rounded-lg border border-green-100 transition-all hover:bg-green-100 group">
                            <input
                                id="syncEbay"
                                name="syncEbay"
                                type="checkbox"
                                defaultChecked={vehicle?.syncEbay}
                                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="syncEbay" className="ml-3 block text-sm font-bold text-green-900 cursor-pointer">
                                Zu eBay übertragen
                                <span className="block font-normal text-xs text-green-600">Exportiert dieses Fahrzeug zu eBay</span>
                            </label>
                        </div>

                        <div className="sm:col-span-3 flex items-center p-4 bg-indigo-50 rounded-lg border border-indigo-100 transition-all hover:bg-indigo-100 group">
                            <input
                                id="syncKleinanzeigen"
                                name="syncKleinanzeigen"
                                type="checkbox"
                                defaultChecked={vehicle?.syncKleinanzeigen}
                                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="syncKleinanzeigen" className="ml-3 block text-sm font-bold text-indigo-900 cursor-pointer">
                                Zu Kleinanzeigen übertragen
                                <span className="block font-normal text-xs text-indigo-600">Exportiert dieses Fahrzeug zu Kleinanzeigen.de</span>
                            </label>
                        </div>

                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700">
                                {t.vehicle.images}
                            </label>
                            <div 
                                className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all cursor-pointer ${
                                    isDragging 
                                    ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-md' 
                                    : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'
                                }`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="space-y-1 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                        >
                                            <span>Upload files</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="sr-only"
                                                multiple
                                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/jfif,.jfif,.jpg,.jpeg,.png,.gif,.webp"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">JPG, JFIF, PNG, GIF, WEBP bis zu 25MB pro Datei</p>
                                </div>
                            </div>

                            {/* Unified Image Grid with DND */}
                            <div className="mt-6">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={images.map(img => img.id)}
                                        strategy={rectSortingStrategy}
                                    >
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                            {images.map((img, index) => (
                                                <SortableImage 
                                                    key={img.id}
                                                    id={img.id}
                                                    url={img.url}
                                                    index={index}
                                                    onRemove={removeFile}
                                                    onEdit={editFile}
                                                    isFirst={index === 0}
                                                    isUploading={img.isUploading}
                                                />
                                            ))}
                                            
                                            {/* Add Button (Placeholder) */}
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
                                            >
                                                <svg className="h-8 w-8 mb-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                <span className="text-xs font-medium">Hinzufügen</span>
                                            </div>
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="equipment" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.equipment} (comma separated)
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="equipment"
                                    id="equipment"
                                    defaultValue={equipmentString}
                                    placeholder="Navigation, Heated Seats, Sunroof"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.description}
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    defaultValue={vehicle?.description || ''}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="descriptionEn" className="block text-sm font-medium text-gray-700">
                                {t.vehicle.descriptionEn}
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="descriptionEn"
                                    name="descriptionEn"
                                    rows={3}
                                    defaultValue={(vehicle as any)?.descriptionEn || ''}
                                    placeholder="Enter English description here..."
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6 border-t border-gray-100 mt-4 pt-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Exklusive Felder für mobile.de</h4>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="titleMobileDe" className="block text-sm font-medium text-gray-700">
                                Titel (mobile.de)
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    id="titleMobileDe"
                                    name="titleMobileDe"
                                    defaultValue={(vehicle as any)?.titleMobileDe || ''}
                                    placeholder="z.B. Mercedes CLA 180d Automatik | 2019 | EURO6 | Schwarz | Sparsam"
                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="shortDescMobileDe" className="block text-sm font-medium text-gray-700">
                                Kurzbeschreibung (mobile.de)
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                                Wird an mobile.de gesendet. Wenn leer, wird die normale Fahrzeugbeschreibung verwendet.
                            </p>
                            <div className="mt-1">
                                <textarea
                                    id="shortDescMobileDe"
                                    name="shortDescMobileDe"
                                    rows={3}
                                    defaultValue={(vehicle as any)?.shortDescMobileDe || ''}
                                    placeholder="Kurztext für mobile.de eingeben..."
                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all items-center gap-2`}
                    >
                        {isSubmitting && (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isSubmitting ? 'Wird gespeichert...' : (isEdit ? t.actions.update : t.actions.save)}
                    </button>
                </div>
            </div>

            {editingImage && (
                <ImageEditor 
                    imageUrl={editingImage.url}
                    onSave={handleSaveEditedImage}
                    onCancel={() => setEditingImage(null)}
                />
            )}
        </form>
    )
}
