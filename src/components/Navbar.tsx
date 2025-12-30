'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function Navbar() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    // Check if we are on an auth page
    const isAuthPage = pathname === '/login' || pathname === '/signup'

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        setUser(null)
    }

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link href="/" className="font-bold tracking-tight text-lg">
                    Suvojit's Gallery
                </Link>

                <div className="flex items-center gap-4">
                    {isAuthPage ? (
                        /* Minimal Navbar for Auth Pages */
                        <Link href="/signup" className="nav-btn primary">
                            Sign Up
                        </Link>
                    ) : (
                        /* Standard Navbar */
                        user ? (
                            <>
                                <Link href="/profile" className="nav-btn">
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="nav-btn"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="nav-btn">
                                    Log In
                                </Link>
                                <Link href="/signup" className="nav-btn primary">
                                    Sign Up
                                </Link>
                            </>
                        )
                    )}
                </div>
            </div>
        </nav>
    )
}
