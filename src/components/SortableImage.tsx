'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableImageProps {
    id: string
    url: string
    index: number
    onRemove: (id: string) => void
    isFirst?: boolean
    isUploading?: boolean
}

export function SortableImage({ id, url, index, onRemove, isFirst, isUploading }: SortableImageProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ 
        id,
        disabled: isUploading
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200 transition-all hover:shadow-md"
        >
            <div 
                {...attributes} 
                {...listeners} 
                className={`absolute inset-0 ${isUploading ? 'cursor-wait' : 'cursor-grab active:cursor-grabbing'}`}
            >
                <img 
                    src={url} 
                    alt={`Vehicle ${index + 1}`} 
                    className={`h-full w-full object-cover transition-all ${isUploading ? 'blur-sm scale-110' : ''}`} 
                />
                
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[2px]">
                        <div className="flex flex-col items-center gap-2">
                            <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-[10px] font-bold text-blue-700 bg-white/80 px-1.5 py-0.5 rounded-full shadow-sm">Upload...</span>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Number Badge */}
            <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                {index + 1}
            </div>

            {/* Gallery Badge */}
            {isFirst && (
                <div className="absolute top-2 right-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                    Galeriebild
                </div>
            )}

            {/* Remove Button */}
            {!isUploading && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(id);
                    }}
                    className="absolute bottom-2 right-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg backdrop-blur-sm"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    )
}
