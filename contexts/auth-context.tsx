"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import {
  auth,
  onAuthStateChanged,
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  getDocument,
  updateDocument,
} from "@/lib/firebase"

type AuthContextType = {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  signInWithGoogle: () => Promise<{ user: User | null; error: string | null }>
  signOut: () => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signIn: async () => ({ user: null, error: "AuthContext not initialized" }),
  signUp: async () => ({ user: null, error: "AuthContext not initialized" }),
  signInWithGoogle: async () => ({ user: null, error: "AuthContext not initialized" }),
  signOut: async () => ({ error: "AuthContext not initialized" }),
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        try {
          // Check if user is admin in Firestore
          const { data } = await getDocument("users", user.uid)

          // Check if the user's email is the admin email or if they have the admin role
          const isUserAdmin = user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || data?.role === "admin"

          setIsAdmin(isUserAdmin)

          // If user is admin but doesn't have the role set in Firestore, update it
          if (isUserAdmin && data?.role !== "admin") {
            await updateDocument("users", user.uid, { role: "admin" })
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

