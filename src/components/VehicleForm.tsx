'use client'

import { createVehicle, updateVehicle } from '@/app/actions'
import { Vehicle, Image, Equipment } from '@prisma/client'
import { carData } from '@/lib/car-data'
import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/components/LanguageContext'

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
}

export default function VehicleForm({ vehicle }: { vehicle?: VehicleWithRelations }) {
    const { t } = useLanguage()
    const isEdit = !!vehicle
    const baseAction = isEdit ? updateVehicle.bind(null, vehicle.id) : createVehicle

    const [selectedMake, setSelectedMake] = useState<string>(vehicle?.make || '')
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Cleanup previews
    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url))
        }
    }, [previews])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            setSelectedFiles(prev => [...prev, ...newFiles])

            const newUrls = newFiles.map(file => URL.createObjectURL(file))
            setPreviews(prev => [...prev, ...newUrls])

            // Reset the input value so the same file can be selected again if needed
            // and to ensure the onChange event fires even if the same files are selected
            e.target.value = ''
        }
    }

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => {
            const urlToRemove = prev[index]
            URL.revokeObjectURL(urlToRemove)
            return prev.filter((_, i) => i !== index)
        })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        // Append selected files manually
        selectedFiles.forEach(file => {
            formData.append('images', file)
        })

        await baseAction(formData)
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

                        <div className="sm:col-span-3 flex items-center">
                            <input
                                id="syncAutoScout24"
                                name="syncAutoScout24"
                                type="checkbox"
                                defaultChecked={vehicle?.syncAutoScout24}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="syncAutoScout24" className="ml-2 block text-sm font-medium text-blue-700">
                                Zu AutoScout24 übertragen
                            </label>
                        </div>

                        <div className="sm:col-span-3 flex items-center">
                            <input
                                id="syncMobileDe"
                                name="syncMobileDe"
                                type="checkbox"
                                defaultChecked={vehicle?.syncMobileDe}
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="syncMobileDe" className="ml-2 block text-sm font-medium text-orange-700">
                                Zu mobile.de übertragen
                            </label>
                        </div>

                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700">
                                {t.vehicle.images}
                            </label>
                            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
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
                                                accept="image/*"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>

                            {/* Previews of NEWLY selected files */}
                            {previews.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected for Upload:</h4>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                        {previews.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <img src={url} alt={`Preview ${index}`} className="h-24 w-full object-cover rounded" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Existing Images */}
                            {vehicle?.images && vehicle.images.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Images:</h4>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                        {vehicle.images.map((img) => (
                                            <div key={img.id} className="relative group">
                                                <img src={img.url} alt="Vehicle" className="h-24 w-full object-cover rounded" />
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (confirm('Are you sure you want to delete this image?')) {
                                                            const { deleteImage } = await import('@/app/actions')
                                                            await deleteImage(img.id)
                                                        }
                                                    }}
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                    </div>
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {isEdit ? t.actions.update : t.actions.save}
                    </button>
                </div>
            </div>
        </form>
    )
}
