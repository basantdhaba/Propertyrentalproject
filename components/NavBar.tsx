"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function NavBar() {
  const { user, isAdmin } = useAuth()

  return (
    <nav className="bg-indigo-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          RentEase
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {isAdmin ? (
                <Link href="/admin" className="text-white hover:underline">
                  Admin Panel
                </Link>
              ) : (
                <Link href="/dashboard" className="text-white hover:underline">
                  Dashboard
                </Link>
              )}
              <button onClick={async () => await signOut()} className="text-white hover:underline">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white hover:underline">
                Login
              </Link>
              <Link href="/register" className="bg-white text-indigo-600 px-4 py-2 rounded hover:bg-gray-100">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

