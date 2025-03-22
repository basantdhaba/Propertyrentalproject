"use client"

import { useEffect, useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db, ADMIN_EMAIL, ADMIN_PASSWORD } from "@/lib/firebase"

export default function AdminInit() {
  const [status, setStatus] = useState<string>("Checking admin account...")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        // Check if admin user already exists
        const adminDocRef = doc(db, "users", "admin")
        const adminDoc = await getDoc(adminDocRef)

        if (adminDoc.exists()) {
          setStatus("Admin account already exists.")
          setSuccess(true)
          return
        }

        // Create admin user in Firebase Auth
        setStatus("Creating admin account...")
        const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD)
        const user = userCredential.user

        // Create admin user in Firestore
        await setDoc(doc(db, "users", user.uid), {
          email: ADMIN_EMAIL,
          name: "Admin User",
          role: "admin",
          created_at: new Date(),
          updated_at: new Date(),
        })

        setStatus("Admin account created successfully!")
        setSuccess(true)
      } catch (error: any) {
        console.error("Error initializing admin:", error)
        setError(error.message)
        setStatus("Failed to create admin account.")
      }
    }

    initializeAdmin()
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Admin Initialization</h1>
          <p className="mt-2 text-gray-600">{status}</p>
        </div>

        {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {success && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
            Admin account is ready. You can now log in with the following credentials:
            <br />
            Email: {ADMIN_EMAIL}
            <br />
            Password: {ADMIN_PASSWORD}
          </div>
        )}

        <div className="text-center">
          <a
            href="/login"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    </div>
  )
}

