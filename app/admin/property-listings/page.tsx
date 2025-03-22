"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getAllProperties, updateDocument, deleteDocument } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Trash2, Eye, Check, X } from "lucide-react"
import Link from "next/link"

export default function PropertyListingsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login?redirect=/admin/property-listings")
    }
  }, [user, loading, isAdmin, router])

  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProperties(true)
      try {
        const { data, error } = await getAllProperties()
        if (error) throw new Error(error)
        setProperties(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoadingProperties(false)
      }
    }

    if (user && isAdmin) {
      fetchProperties()
    }
  }, [user, isAdmin])

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    try {
      await updateDocument("properties", propertyId, { status: newStatus })
      setProperties((prevProperties) =>
        prevProperties.map((property) => (property.id === propertyId ? { ...property, status: newStatus } : property)),
      )
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      await deleteDocument("properties", propertyId)
      setProperties((prevProperties) => prevProperties.filter((property) => property.id !== propertyId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const filteredProperties = properties.filter((property) => {
    if (activeTab === "all") return true
    return property.status === activeTab
  })

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Property Listings</CardTitle>
          <CardDescription>Manage all property listings from here</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {loadingProperties ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No properties found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Property</th>
                        <th className="py-3 px-6 text-left">Owner</th>
                        <th className="py-3 px-6 text-center">Status</th>
                        <th className="py-3 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                      {filteredProperties.map((property) => (
                        <tr key={property.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6 text-left">
                            <div className="font-medium">{property.name}</div>
                            <div className="text-xs text-gray-500">
                              {property.location} • ₹{property.price || property.monthlyRent}/month
                            </div>
                          </td>
                          <td className="py-3 px-6 text-left">
                            <div>{property.ownerEmail}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(property.createdAt?.seconds * 1000).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-6 text-center">
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
                          </td>
                          <td className="py-3 px-6 text-center">
                            <div className="flex item-center justify-center gap-2">
                              <Link href={`/property/${property.id}`}>
                                <Button variant="outline" size="sm" className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>

                              <Link href={`/admin/property-listings/${property.id}/edit`}>
                                <Button variant="outline" size="sm" className="flex items-center gap-1">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>

                              {property.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
                                    onClick={() => handleStatusChange(property.id, "approved")}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => handleStatusChange(property.id, "rejected")}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the property listing.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleDeleteProperty(property.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Total: {filteredProperties.length} {activeTab !== "all" ? activeTab : ""} properties
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

