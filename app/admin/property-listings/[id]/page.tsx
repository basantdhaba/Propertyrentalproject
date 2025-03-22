"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getDocument, updateDocument } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, ArrowLeft, Check, X } from "lucide-react"
import Link from "next/link"
import PropertyReadOnlyView from "@/components/PropertyReadOnlyView"

export default function PropertyDetailsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const [property, setProperty] = useState<any>(null)
  const [loadingProperty, setLoadingProperty] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login?redirect=/admin/property-listings")
    }
  }, [user, loading, isAdmin, router])

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return

      setLoadingProperty(true)
      try {
        const { data, error } = await getDocument("properties", propertyId)
        if (error) throw new Error(error)
        if (!data) throw new Error("Property not found")
        setProperty(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoadingProperty(false)
      }
    }

    if (user && isAdmin && propertyId) {
      fetchProperty()
    }
  }, [user, isAdmin, propertyId])

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateDocument("properties", propertyId, { status: newStatus })
      setProperty((prev: any) => ({ ...prev, status: newStatus }))
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (loadingProperty) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Error: {error}</div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Property not found
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/property-listings" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Link>

        <div className="flex items-center gap-2">
          <Badge
            className={
              property.status === "approved"
                ? "bg-green-100 text-green-800"
                : property.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
            }
          >
            {property.status}
          </Badge>

          {property.status === "pending" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleStatusChange("approved")}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => handleStatusChange("rejected")}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}

          <Link href={`/admin/property-listings/${propertyId}/edit`}>
            <Button size="sm" className="flex items-center gap-1">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <PropertyReadOnlyView property={property} />
    </div>
  )
}

