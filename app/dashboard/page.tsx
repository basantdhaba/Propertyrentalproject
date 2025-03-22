"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getDocumentsByField } from "@/lib/firebase"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, User, Calendar, MapPin, Eye, Edit } from "lucide-react"

export default function Dashboard() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<any[]>([])
  const [interestedUsers, setInterestedUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch owner's properties
        const { data: propertiesData, error: propertiesError } = await getDocumentsByField(
          "properties",
          "owner",
          user.uid,
        )
        if (propertiesError) throw new Error(propertiesError)

        console.log("Fetched properties:", propertiesData)
        setProperties(propertiesData)

        // Fetch interested users for each property
        const interests: any[] = []
        for (const property of propertiesData) {
          const { data: interestsData, error: interestsError } = await getDocumentsByField(
            "interests",
            "propertyId",
            property.id,
          )
          if (interestsError) throw new Error(interestsError)
          interests.push(...interestsData)
        }
        setInterestedUsers(interests)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )

  if (error)
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Error: {error}</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>

      <Tabs defaultValue="properties">
        <TabsList className="mb-6">
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="interested">Interested Users</TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">My Properties</h2>
            <Link href="/list-property">
              <Button>List New Property</Button>
            </Link>
          </div>

          {properties.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Home className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Properties Listed</h3>
                <p className="text-gray-500 mb-6">You haven't listed any properties yet.</p>
                <Link href="/list-property">
                  <Button>List Your First Property</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="relative">
                    <div className="aspect-video bg-gray-200">
                      {property.imageUrl ? (
                        <img
                          src={property.imageUrl || "/placeholder.svg"}
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <Badge
                      className={`absolute top-2 right-2 ${
                        property.status === "approved"
                          ? "bg-green-500"
                          : property.status === "rejected"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }`}
                    >
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </Badge>
                  </div>

                  <CardHeader>
                    <CardTitle>{property.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" /> {property.location}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm">{property.bedrooms} Bedrooms</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm">
                          Available: {new Date(property.availableFrom).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1 text-gray-500">₹</span>
                        <span className="text-sm">{property.price || property.monthlyRent}/month</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm">{property.interested?.length || 0} interested</span>
                      </div>
                    </div>

                    {property.status === "pending" && (
                      <p className="text-sm text-yellow-600 mb-4">This property is pending approval by the admin.</p>
                    )}

                    {property.status === "rejected" && (
                      <p className="text-sm text-red-600 mb-4">This property was rejected. Please edit and resubmit.</p>
                    )}
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <Link href={`/property/${property.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                    </Link>
                    <Link href={`/properties/${property.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="interested">
          <h2 className="text-2xl font-semibold mb-6">Interested Users</h2>

          {interestedUsers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Interested Users Yet</h3>
                <p className="text-gray-500">When users express interest in your properties, they will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {interestedUsers.map((interest) => (
                <Card key={interest.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">Interest in {interest.propertyName}</CardTitle>
                    <CardDescription>
                      Submitted on {new Date(interest.createdAt?.seconds * 1000).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2">User Details</h3>
                        <div className="mt-2 space-y-1">
                          <p>
                            <span className="font-medium">Religion:</span> {interest.religion}
                          </p>
                          <p>
                            <span className="font-medium">Occupation:</span> {interest.occupation}
                          </p>
                          <p>
                            <span className="font-medium">Marital Status:</span> {interest.maritalStatus}
                          </p>
                          {interest.maritalStatus === "married" ? (
                            <>
                              <p>
                                <span className="font-medium">Family Members:</span> {interest.familyMembers || "N/A"}
                              </p>
                              <p>
                                <span className="font-medium">Age Groups:</span> {interest.ageGroup || "N/A"}
                              </p>
                            </>
                          ) : (
                            <p>
                              <span className="font-medium">Status:</span> {interest.studentOrWorking || "N/A"}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Contact Number:</span>{" "}
                            {interest.contactNumber || interest.userPhone || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Video Tour Requested:</span>{" "}
                            {interest.videoTour ? "Yes" : "No"}
                          </p>
                          <p>
                            <span className="font-medium">Agreed to Fee:</span> {interest.agreeToFee ? "Yes" : "No"}
                          </p>
                          <p>
                            <span className="font-medium">Payment Status:</span> {interest.paymentStatus || "Pending"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Property</h3>
                        <Link href={`/property/${interest.propertyId}`} className="text-blue-600 hover:underline">
                          View Property Details
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

