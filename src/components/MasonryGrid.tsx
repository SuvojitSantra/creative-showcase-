'use client'

import ImageCard from './ImageCard'

interface Artwork {
    id: number
    title: string
    image_url: string
    user_id?: string
}

export default function MasonryGrid({ artworks }: { artworks: Artwork[] }) {
    if (!artworks || artworks.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500 animate-fade-in">
                <p>No artworks found yet.</p>
            </div>
        )
    }

    return (
        <div className="masonry-columns animate-fade-in pb-20">
            {artworks.map((art) => (
                <ImageCard key={art.id} artwork={art} />
            ))}
        </div>
    )
}
