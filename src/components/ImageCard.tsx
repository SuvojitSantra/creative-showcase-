'use client'

import Image from 'next/image'

interface Artwork {
    id: number
    title: string
    image_url: string
    user_id?: string
}

export default function ImageCard({ artwork }: { artwork: Artwork }) {
    return (
        <div className="mb-6 break-inside-avoid relative group overflow-hidden rounded-xl bg-gray-900/50 hover:shadow-xl transition-all duration-500 ease-in-out border border-white/5">
            <div className="relative w-full overflow-hidden">
                <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    loading="lazy"
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out min-h-[150px]"
                    style={{ display: 'block' }} // Removes bottom whitespace
                />

                {/* Professional Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 backdrop-blur-[2px]">
                    <p className="text-white font-medium truncate tracking-wide text-sm">{artwork.title}</p>
                </div>
            </div>
        </div>
    )
}
