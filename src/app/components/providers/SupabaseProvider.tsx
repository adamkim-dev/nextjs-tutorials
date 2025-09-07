'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { Session, User } from '@supabase/supabase-js'

type SupabaseContextType = {
  supabase: typeof supabase
  user: User | null
  session: Session | null
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    supabase,
    user,
    session
  }

  return (
    <SupabaseContext.Provider value={value}>
      {!loading && children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}