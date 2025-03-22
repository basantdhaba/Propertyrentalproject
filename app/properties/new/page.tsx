"use client"

import ProtectedRoute from "@/components/protected-route"
import PropertyForm from "@/components/property-form"

export default function NewProperty() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add New Property</h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-6 shadow">
            <PropertyForm />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

