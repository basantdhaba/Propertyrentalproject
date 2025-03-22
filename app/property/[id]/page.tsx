"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getDocument } from "@/lib/firebase"
import PropertyDetails from "@/components/PropertyDetails"
import PropertyReadOnlyView from "@/components/PropertyReadOnlyView"
import ProtectedRoute from "@/components/protected-route"

export default function PropertyPage() {
  const params = useParams()
  const propertyId = params.id as string
  const { user } = useAuth()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data, error } = await getDocument("properties", propertyId)
        if (error) throw new Error(error)
        if (!data) throw new Error("Property not found")

        setProperty(data)

        // Check if current user is the owner
        if (user && data.owner === user.uid) {
          setIsOwner(true)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [propertyId, user])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Error: {error}</div>
  }

  return (
    <ProtectedRoute>
      {isOwner ? (
        <div className="container mx-auto px-4 py-8">
          <PropertyReadOnlyView property={property} />
        </div>
      ) : (
        <PropertyDetails propertyId={propertyId} />
      )}
    </ProtectedRoute>
  )
}

