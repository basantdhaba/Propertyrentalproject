"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getDocument } from "@/lib/firebase"
import PropertyEditForm from "@/components/PropertyEditForm"
import Loading from "@/components/Loading"

export default function EditPropertyPage() {
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
        console.log("Fetching property with ID:", propertyId)
        const { data, error } = await getDocument("properties", propertyId)

        if (error) {
          console.error("Error fetching property:", error)
          throw new Error(error)
        }

        if (!data) {
          console.error("Property not found")
          throw new Error("Property not found")
        }

        console.log("Property data fetched:", data)

        // Transform data to match PropertyListingForm structure
        const transformedData = {
          ...data,
          // Ensure these fields exist with the correct names
          name: data.name || "",
          propertyType: data.propertyType || data.type || "",
          totalBuildingFloor: data.totalBuildingFloor || "",
          rentFloor: data.rentFloor || "",
          address: data.address || "",
          area: data.area || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          bedrooms: data.bedrooms || "",
          bathrooms: data.bathrooms || "",
          rentTo: data.rentTo || "",
          familySize: data.familySize || "",
          monthlyRent: data.monthlyRent || data.price || "",
          maintenanceCharges: data.maintenanceCharges || "",
          securityDeposit: data.securityDeposit || "",
          petsAllowed: data.petsAllowed || false,
          religionPreference: data.religionPreference || false,
          specificReligion: data.specificReligion || "",
          videoLink: data.videoLink || data.youtubeUrl || "",
          createVideo: data.createVideo || false,
          contactNumber: data.contactNumber || "",
          description: data.description || "",
          amenities: data.amenities || "",
          availableFrom: data.availableFrom || "",
          status: data.status || "pending",
        }

        console.log("Transformed property data:", transformedData)
        setProperty(transformedData)
      } catch (err: any) {
        console.error("Error in fetchProperty:", err)
        setError(err.message)
      } finally {
        setLoadingProperty(false)
      }
    }

    if (user && isAdmin && propertyId) {
      fetchProperty()
    }
  }, [user, isAdmin, propertyId])

  if (loading || !user || !isAdmin) {
    return <Loading />
  }

  if (loadingProperty) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Error: {error}</div>
      </div>
    )
  }

  // Only render the form when property data is available
  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Property data is not available. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <PropertyEditForm property={property} propertyId={propertyId} />
      </div>
    </div>
  )
}

