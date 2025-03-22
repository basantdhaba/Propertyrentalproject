"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getAllProperties } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, MapPin, Bath, User, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [properties, setProperties] = useState<any[]>([])
  const [filteredProperties, setFilteredProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await getAllProperties()
        if (error) throw new Error(error)

        // Only show approved properties
        const approvedProperties = data.filter((property) => property.status === "approved")
        setProperties(approvedProperties)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  useEffect(() => {
    if (query && properties.length > 0) {
      const searchQuery = query.toLowerCase()
      const filtered = properties.filter((property) => {
        const searchableFields = [
          property.name,
          property.location,
          property.address,
          property.city,
          property.state,
          property.description,
          property.type,
          property.propertyType,
        ]
          .filter(Boolean)
          .map((field) => field.toLowerCase())

        return searchableFields.some((field) => field.includes(searchQuery))
      })
      setFilteredProperties(filtered)
    } else {
      setFilteredProperties(properties)
    }
  }, [query, properties])

  const handlePropertyClick = (propertyId: string) => {
    if (!user) {
      router.push(`/login?redirect=/property/${propertyId}`)
    } else {
      router.push(`/property/${propertyId}`)
    }
  }

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{query ? `Search Results for "${query}"` : "All Properties"}</h1>

      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">No properties found</h3>
          <p className="mt-1 text-gray-500">
            {query
              ? `No properties match your search for "${query}"`
              : "There are no properties available at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handlePropertyClick(property.id)}
            >
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{property.name}</h3>
                  <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-gray-800 mt-1">
                    {property.type || property.propertyType || "Apartment"}
                  </span>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <Home className="mr-1 h-4 w-4 text-gray-700 flex-shrink-0" />
                    <span className="truncate">{property.bedrooms || "N/A"} Bedrooms</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="mr-1 h-4 w-4 text-gray-700 flex-shrink-0" />
                    <span className="truncate">{property.bathrooms || "N/A"} Bathrooms</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1 flex-shrink-0">📏</span>
                    <span className="truncate">{property.area || "N/A"} sq ft</span>
                  </div>
                  <div className="flex items-center">
                    <User className="mr-1 h-4 w-4 text-gray-700 flex-shrink-0" />
                    <span className="truncate">{property.interested?.length || 0} interested</span>
                  </div>
                </div>

                <div className="flex items-center mb-2 text-sm">
                  <MapPin className="mr-1 h-4 w-4 text-gray-700 flex-shrink-0" />
                  <p className="text-gray-700 truncate">
                    {property.location || property.address || "Location not specified"}
                  </p>
                </div>

                <div className="flex items-center mb-3 text-sm">
                  <Calendar className="mr-1 h-4 w-4 text-gray-700 flex-shrink-0" />
                  <p className="text-gray-700">
                    Available from:{" "}
                    {property.availableFrom ? new Date(property.availableFrom).toLocaleDateString() : "Not specified"}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-900">
                    ₹ {property.price || property.monthlyRent || "Price not specified"}
                    <span className="text-xs font-normal text-gray-700">/month</span>
                  </div>
                  <Button size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

