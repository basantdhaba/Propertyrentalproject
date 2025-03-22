"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getDocumentsByField } from "@/lib/firebase"
import ProtectedRoute from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"
import Link from "next/link"

export default function TenantsPage() {
  const { user } = useAuth()
  const [interestedUsers, setInterestedUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch properties owned by the current user
        const { data: propertiesData, error: propertiesError } = await getDocumentsByField(
          "properties",
          "owner",
          user.uid,
        )
        if (propertiesError) throw new Error(propertiesError)

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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Interested Tenants</h1>

        {interestedUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">No Interested Tenants Yet</h3>
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
                              <span className="font-medium">Family Members:</span> {interest.familyMembers}
                            </p>
                            <p>
                              <span className="font-medium">Age Groups:</span> {interest.ageGroup}
                            </p>
                          </>
                        ) : (
                          <p>
                            <span className="font-medium">Status:</span> {interest.studentOrWorking}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Video Tour Requested:</span> {interest.videoTour ? "Yes" : "No"}
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
      </div>
    </ProtectedRoute>
  )
}

