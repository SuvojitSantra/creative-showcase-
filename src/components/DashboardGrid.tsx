'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface Artwork {
    id: string
    title: string
    image_url: string
    created_at: string
}

export default function DashboardGrid({ initialArtworks }: { initialArtworks: Artwork[] }) {
    const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this artwork? This cannot be undone.')) return

        setDeletingId(id)

        try {
            // Delete from DB and return the deleted row count
            const { data, error } = await supabase
                .from('artworks')
                .delete()
                .eq('id', id)
                .select() // Important: required to get back the deleted row data/count

            if (error) throw error

            // Check for silent failure (RLS policy blocking delete)
            if (!data || data.length === 0) {
                throw new Error('Deletion failed. You might not have permission to delete this item (Check RLS Policies).')
            }

            // Update UI optimistically ONLY if delete succeeded
            setArtworks(artworks.filter(a => a.id !== id))
            router.refresh()

        } catch (error: any) {
            console.error('Delete error:', error)
            alert('Error deleting: ' + error.message)
            // Revert optimistic update if we did it early (we didn't yet, but good practice)
        } finally {
            setDeletingId(null)
        }
    }

    // Time Ago Helper
    const timeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return 'Just now'
        const diffInMinutes = Math.floor(diffInSeconds / 60)
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours}h ago`
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays}d ago`
    }

    if (artworks.length === 0) {
        return (
            <div className="text-center py-16 border border-dashed border-[#23262f] rounded-xl bg-[#161a21]/50">
                <p className="text-secondary mb-2">No memories yet.</p>
                <p className="text-sm text-gray-500">Upload your first one to get started.</p>
            </div>
        )
    }

    return (
        <div className="uploads-grid">
            {artworks.map((art) => (
                <div key={art.id} className="upload-card group relative">
                    <div className="relative overflow-hidden aspect-[4/3]">
                        <img
                            src={art.image_url}
                            alt={art.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Delete Action Action */}
                        <button
                            onClick={() => handleDelete(art.id)}
                            disabled={deletingId === art.id}
                            className="absolute top-2 right-2 bg-red-500/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 disabled:opacity-50 transform hover:scale-105"
                            title="Delete Artwork"
                        >
                            {deletingId === art.id ? (
                                <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="upload-meta flex justify-between items-start">
                        <div className="overflow-hidden">
                            <p className="upload-title">{art.title}</p>
                            <small>Uploaded • {timeAgo(art.created_at)}</small>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
