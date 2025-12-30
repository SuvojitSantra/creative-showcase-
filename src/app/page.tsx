import { createClient } from '@/utils/supabase/server'
import MasonryGrid from '@/components/MasonryGrid'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  // Check auth state for Hero CTA
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch artwork for the mosaic
  const { data: artworks } = await supabase
    .from('artworks')
    .select('*')
    .limit(20)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-12">
      {/* 1. The Visual Hook (Hero Section) */}
      <section className="relative py-20 px-4 flex flex-col items-center justify-center text-center overflow-hidden">

        {/* Simplified SaaS Hero */}
        <div className="max-w-2xl w-full text-center animate-fade-in pt-10">
          <h1 className="h1 mb-6 text-white">
            Suvojit's Gallery
          </h1>

          <p className="text-lg text-secondary mb-10 leading-relaxed">
            A platform for artists to upload and share their digital memories.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/profile"
                className="btn btn-primary px-6 py-3"
              >
                Upload Artwork
              </Link>
            ) : (
              <>
                {/* Scroll to Grid or Link to Gallery? User said "Explore Gallery" */}
                <a
                  href="#gallery"
                  className="btn btn-outline px-6 py-3"
                >
                  Explore Gallery
                </a>
                <Link
                  href="/signup"
                  className="btn btn-primary px-6 py-3"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 2. The Mosaic Showcase */}
      <section id="gallery" className="container mx-auto">
        {/* Minimal Header if needed, or just the grid as 'Random public uploads' implies less structure */}
        <div className="mb-8 px-4">
          {/* Optional, can be empty or minimal */}
        </div>
        <MasonryGrid artworks={artworks || []} />
      </section>
    </div>
  )
}
