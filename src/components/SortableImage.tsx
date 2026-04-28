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
}

export function SortableImage({ id, url, index, onRemove, isFirst }: SortableImageProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id })

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
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
                <img 
                    src={url} 
                    alt={`Vehicle ${index + 1}`} 
                    className="h-full w-full object-cover" 
                />
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
        </div>
    )
}
