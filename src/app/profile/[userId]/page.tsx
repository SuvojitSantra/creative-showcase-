import { createClient } from '@/utils/supabase/server'
import MasonryGrid from '@/components/MasonryGrid'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Props {
    params: { userId: string }
}

export default async function PublicProfilePage({ params }: Props) {
    const supabase = await createClient()
    const { userId } = params

    const { data: artworks } = await supabase
        .from('artworks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    // Ideally we would fetch user profile info here too if it existed

    if (!artworks || artworks.length === 0) {
        // We don't error 404 here in case user exists but has no art, 
        // but without profile table we can't confirm user existence easily.
        // We'll just show empty state.
    }

    return (
        <div className="space-y-8">
            <div className="text-center py-10">
                <h1 className="text-4xl font-bold text-white mb-2">@{userId}</h1>
                {/* Ideally we would have real username, using ID for now as requested by constraint */}
                <p className="text-gray-400">Artist Portfolio</p>
            </div>

            <MasonryGrid artworks={artworks || []} />
        </div>
    )
}
