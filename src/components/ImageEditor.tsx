'use client'

import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '@/lib/image-utils'

interface ImageEditorProps {
    imageUrl: string
    onSave: (blob: Blob) => void
    onCancel: () => void
}

export function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [rotation, setRotation] = useState(0)
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [flip, setFlip] = useState({ horizontal: false, vertical: false })
    const [isProcessing, setIsProcessing] = useState(false)

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        if (!croppedAreaPixels) return

        setIsProcessing(true)
        try {
            const croppedBlob = await getCroppedImg(
                imageUrl,
                croppedAreaPixels,
                rotation,
                flip
            )
            if (croppedBlob) {
                onSave(croppedBlob)
            }
        } catch (e) {
            console.error(e)
            alert('Fehler beim Bearbeiten des Bildes.')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
                <h3 className="text-lg font-medium text-white">Bild bearbeiten</h3>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                        Abbrechen
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isProcessing}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                        {isProcessing ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : null}
                        {isProcessing ? 'Verarbeiten...' : 'Speichern'}
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="relative flex-1 bg-gray-950 overflow-hidden">
                <Cropper
                    image={imageUrl}
                    crop={crop}
                    rotation={rotation}
                    zoom={zoom}
                    aspect={4 / 3}
                    onCropChange={setCrop}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    style={{
                        containerStyle: { background: '#09090b' },
                        mediaStyle: {
                            transform: `rotate(${rotation}deg) scale(${zoom}) scaleX(${flip.horizontal ? -1 : 1}) scaleY(${flip.vertical ? -1 : 1})`,
                        }
                    }}
                />
            </div>

            {/* Controls */}
            <div className="p-6 bg-gray-900 border-t border-gray-800 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Zoom & Rotate */}
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Zoom</label>
                                <span className="text-xs text-blue-400">{zoom.toFixed(1)}x</span>
                            </div>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Drehen</label>
                                <span className="text-xs text-blue-400">{rotation}°</span>
                            </div>
                            <input
                                type="range"
                                value={rotation}
                                min={0}
                                max={360}
                                step={1}
                                aria-labelledby="Rotation"
                                onChange={(e) => setRotation(Number(e.target.value))}
                                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setRotation(prev => (prev - 90) % 360)}
                            className="p-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors border border-gray-700 shadow-sm"
                            title="90° Links drehen"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setRotation(prev => (prev + 90) % 360)}
                            className="p-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors border border-gray-700 shadow-sm"
                            title="90° Rechts drehen"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                        <div className="w-px h-8 bg-gray-800 mx-2" />
                        <button
                            onClick={() => setFlip(prev => ({ ...prev, horizontal: !prev.horizontal }))}
                            className={`px-4 py-2.5 rounded-xl border transition-all text-sm font-medium flex items-center gap-2 ${
                                flip.horizontal ? 'bg-blue-600/20 border-blue-600 text-blue-400' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 12h8M8 17h8" />
                            </svg>
                            Spiegeln H
                        </button>
                        <button
                            onClick={() => setFlip(prev => ({ ...prev, vertical: !prev.vertical }))}
                            className={`px-4 py-2.5 rounded-xl border transition-all text-sm font-medium flex items-center gap-2 ${
                                flip.vertical ? 'bg-blue-600/20 border-blue-600 text-blue-400' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            <svg className="w-4 h-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 12h8M8 17h8" />
                            </svg>
                            Spiegeln V
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
