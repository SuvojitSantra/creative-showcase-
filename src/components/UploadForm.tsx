'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function UploadForm({ userId }: { userId: string }) {
    const [file, setFile] = useState<File | null>(null)
    const [title, setTitle] = useState('')
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0]
            setFile(selected)
            setPreview(URL.createObjectURL(selected))
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !title) return

        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}/${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('showcase-images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('showcase-images')
                .getPublicUrl(filePath)

            // 3. Insert into Database
            const { error: dbError } = await supabase
                .from('artworks')
                .insert({
                    title,
                    image_url: publicUrl,
                    user_id: userId,
                })

            if (dbError) throw dbError

            // Reset
            setFile(null)
            setTitle('')
            setPreview(null)
            router.refresh()

        } catch (error: any) {
            alert('Error uploading: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="upload-card-wrapper animate-fade-in">
            <h3 className="section-title">Upload Artwork</h3>
            <form onSubmit={handleUpload} className="flex flex-col gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2 text-secondary">Title</label>
                    <input
                        type="text"
                        placeholder="e.g. Summer Vacation"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        // Classname now handled by globals input[type="text"]
                        required
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-2 text-secondary">Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            // Styling handled by globals input[type="file"]
                            required
                        />
                    </div>

                    {preview && (
                        <div className="shrink-0">
                            <label className="block text-sm font-medium mb-2 text-secondary">Preview</label>
                            <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#23262f]">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={uploading}
                    className="publish-btn w-full sm:w-auto"
                >
                    {uploading ? 'Uploading...' : 'Upload Memory'}
                </button>
            </form>
        </div>
    )
}
