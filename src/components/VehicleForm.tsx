'use client'

import { createVehicle, updateVehicle } from '@/app/actions'
import { Vehicle, Image, Equipment } from '@prisma/client'
import { carData } from '@/lib/car-data'
import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/components/LanguageContext'

type VehicleWithRelations = Vehicle & {
    images: Image[]
    equipment: Equipment[]
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
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
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
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
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
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
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
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
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
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
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
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
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
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
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
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
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
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
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                >
                                    <option value="Manual">{t.values.manual}</option>
                                    <option value="Automatic">{t.values.automatic}</option>
                                </select>
                            </div>
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
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
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
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
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
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
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
