"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

type AuthFormProps = {
  isLogin?: boolean
  onError?: (error: string) => void
  onLoading?: (loading: boolean) => void
}

export default function AuthForm({ isLogin = true, onError, onLoading }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (onLoading) onLoading(true)

    try {
      const { user, error } = isLogin ? await signIn(email, password) : await signUp(email, password)

      if (error) {
        setError(error)
        if (onError) onError(error)
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred during authentication"
      setError(errorMessage)
      if (onError) onError(errorMessage)
    } finally {
      setLoading(false)
      if (onLoading) onLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && !onError && <div className="text-red-500">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600" disabled={loading}>
        {loading ? (isLogin ? "Logging in..." : "Signing up...") : isLogin ? "Login" : "Sign Up"}
      </button>
    </form>
  )
}

