"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getDocument } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Bath, Calendar, MapPin, DollarSign, User, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import ExpressInterestButton from "./ExpressInterestButton"

const getYouTubeVideoId = (url: string) => {
  if (!url) return ""

  // Handle different YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)

  return match && match[2].length === 11 ? match[2] : ""
}

export default function PropertyDetails({ propertyId }: { propertyId: string }) {
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch property details
        const { data: propertyData, error: propertyError } = await getDocument("properties", propertyId)
        if (propertyError) throw new Error(propertyError)
        if (!propertyData) throw new Error("Property not found")
        setProperty(propertyData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [propertyId])

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )

  if (error)
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Error: {error}</div>

  if (!property)
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        Property not found
      </div>
    )

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl">{property.name}</CardTitle>
          <CardDescription className="text-sm md:text-base">{property.location}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                {property.imageUrl ? (
                  <img
                    src={property.imageUrl || "/placeholder.svg"}
                    alt={property.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Home className="h-16 w-16 text-gray-400" />
                )}
              </div>

              {/* YouTube Video Section */}
              {property.youtubeUrl && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Property Video</h3>
                  <div
                    className="relative cursor-pointer overflow-hidden rounded-lg"
                    onClick={() => {
                      if (!user) {
                        // Redirect to login if user is not logged in
                        router.push(`/login?redirect=/property/${propertyId}`)
                      } else {
                        window.open(property.youtubeUrl, "_blank")
                      }
                    }}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeVideoId(property.youtubeUrl)}/0.jpg`}
                      alt="Video thumbnail"
                      className="w-full h-auto object-cover"
                    />
                    {!user && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-white text-center p-4">
                          <p className="text-lg font-medium mb-2">Login Required</p>
                          <p className="text-sm">Please login to view this property video</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-red-600 rounded-full p-3 opacity-80">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="flex items-center">
                  <Home className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center">
                  <Bath className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{property.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-blue-500 flex-shrink-0">📏</span>
                  <span className="text-sm sm:text-base">{property.area} sq ft</span>
                </div>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{property.interested?.length || 0} interested</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base truncate">{property.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base">
                    Available: {new Date(property.availableFrom).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base">₹{property.price || property.monthlyRent}/month</span>
                </div>
                <div className="flex items-center">
                  <Star className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Grade {property.grade}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Description</h3>
              <p className="text-gray-700 text-sm sm:text-base">{property.description}</p>

              <div className="mt-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Property Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:text-base">
                  <div>
                    <span className="font-medium">Type:</span> {property.type || property.propertyType}
                  </div>
                  <div>
                    <span className="font-medium">Grade:</span> {property.grade}
                  </div>
                  <div>
                    <span className="font-medium">Available From:</span>{" "}
                    {new Date(property.availableFrom).toLocaleDateString()}
                  </div>
                  {property.totalBuildingFloor && (
                    <div>
                      <span className="font-medium">Total Building Floor:</span> {property.totalBuildingFloor}
                    </div>
                  )}
                  {property.rentFloor && (
                    <div>
                      <span className="font-medium">Rent Floor:</span> {property.rentFloor}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                {user ? (
                  <ExpressInterestButton propertyId={propertyId} propertyName={property.name} />
                ) : (
                  <Button
                    onClick={() => router.push(`/login?redirect=/property/${propertyId}`)}
                    className="w-full bg-black text-white hover:bg-gray-800"
                  >
                    Login to Express Interest
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

