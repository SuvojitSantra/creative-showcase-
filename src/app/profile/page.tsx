import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MasonryGrid from '@/components/MasonryGrid'
import UploadForm from '@/components/UploadForm'
import DashboardGrid from '@/components/DashboardGrid'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: artworks } = await supabase
        .from('artworks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-8 gap-4">
                <div>
                    <h1 className="h1 mb-2">My Dashboard</h1>
                    <p className="text-secondary">Manage your showcase and viewing private collection.</p>
                </div>
                {/* Step 4.1: Hide Raw ID */}
                <div className="user-badge">
                    Account • Personal Workspace
                </div>
            </div>

            {/* Step 4.5: Rhythm (Section Spacing) */}
            <div className="section-spacing">
                <UploadForm userId={user.id} />
            </div>

            {/* Grid Section */}
            <div className="section-spacing">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="section-title mb-0">Your Collection</h2>
                    <span className="text-xs text-secondary bg-[#161a21] px-3 py-1 rounded-full border border-[#23262f]">
                        {artworks?.length || 0} items
                    </span>
                </div>

                {/* Dashboard Grid (Handles Deletion & Empty State) */}
                <DashboardGrid initialArtworks={artworks || []} />
            </div>
        </div>
    )
}
