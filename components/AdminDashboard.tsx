"use client"

import { useState, useEffect } from "react"
import {
  getDocumentsByField,
  updateDocument,
  getInterestedUsers,
  getAdminSettings,
  updateAdminSettings,
  getAllUsers,
} from "@/lib/firebase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, CheckCircle, XCircle, Edit, Eye, FileSpreadsheet } from "lucide-react"
import Link from "next/link"
import * as XLSX from "xlsx"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const [pendingProperties, setPendingProperties] = useState<any[]>([])
  const [approvedProperties, setApprovedProperties] = useState<any[]>([])
  const [interestedUsers, setInterestedUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [adminSettings, setAdminSettings] = useState({
    upiAddress: "",
    interestFee: "100",
    rentWiseFees: {},
  })
  const [isSaving, setIsSaving] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [videoRequests, setVideoRequests] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  const rentRanges = [
    "₹5,000 - ₹10,000",
    "₹10,001 - ₹20,000",
    "₹20,001 - ₹35,000",
    "₹35,001 - ₹50,000",
    "₹50,001 - ₹1,00,000",
    "Above ₹1 Lakh",
  ]

  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch pending properties
        const { data: pendingData, error: pendingError } = await getDocumentsByField("properties", "status", "pending")
        if (pendingError) throw new Error(pendingError)
        setPendingProperties(pendingData)

        // Fetch approved properties
        const { data: approvedData, error: approvedError } = await getDocumentsByField(
          "properties",
          "status",
          "approved",
        )
        if (approvedError) throw new Error(approvedError)
        setApprovedProperties(approvedData)

        // Fetch interested users
        const { data: interestedData, error: interestedError } = await getInterestedUsers()
        if (interestedError) throw new Error(interestedError)
        setInterestedUsers(interestedData)

        // Fetch admin settings
        const { data: settingsData, error: settingsError } = await getAdminSettings()
        if (settingsError) throw new Error(settingsError)
        if (settingsData) {
          setAdminSettings({
            upiAddress: settingsData.upiAddress || "",
            interestFee: settingsData.interestFee || "100",
            rentWiseFees: settingsData.rentWiseFees || {},
          })
        }

        // Fetch contact messages
        const { data: messagesData, error: messagesError } = await getDocumentsByField("messages", "type", "contact")
        if (messagesError) throw new Error(messagesError)
        setMessages(messagesData)

        // Fetch video creation requests
        const { data: requestsData, error: requestsError } = await getDocumentsByField(
          "properties",
          "createVideo",
          true,
        )
        if (requestsError) throw new Error(requestsError)
        setVideoRequests(requestsData)

        // Fetch all users
        const { data: usersData, error: usersError } = await getAllUsers()
        if (usersError) throw new Error(usersError)
        setUsers(usersData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleApprove = async (propertyId: string) => {
    try {
      await updateDocument("properties", propertyId, { status: "approved" })
      setPendingProperties(pendingProperties.filter((p) => p.id !== propertyId))
      const property = pendingProperties.find((p) => p.id === propertyId)
      if (property) {
        setApprovedProperties([...approvedProperties, { ...property, status: "approved" }])
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleReject = async (propertyId: string) => {
    try {
      await updateDocument("properties", propertyId, { status: "rejected" })
      setPendingProperties(pendingProperties.filter((p) => p.id !== propertyId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      await updateAdminSettings(adminSettings)
      alert("Settings saved successfully!")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const downloadExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

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
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="properties">
        <TabsList className="mb-6">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="users">Interested Users</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => router.push("/admin/reports")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Reports
          </Button>
        </TabsList>

        <TabsContent value="properties">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Properties ({pendingProperties.length})</CardTitle>
                <CardDescription>Properties waiting for approval</CardDescription>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-4 top-4"
                  onClick={() => downloadExcel(pendingProperties, "pending-properties")}
                >
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </CardHeader>
              <CardContent>
                {pendingProperties.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No pending properties</p>
                ) : (
                  <div className="space-y-4">
                    {pendingProperties.map((property) => (
                      <div key={property.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{property.name}</h3>
                            <p className="text-sm text-gray-500">{property.location}</p>
                            <div className="mt-2 grid grid-cols-2 gap-x-4 text-sm">
                              <p>
                                <span className="font-medium">Type:</span> {property.type}
                              </p>
                              <p>
                                <span className="font-medium">Price:</span> ₹{property.price}/month
                              </p>
                              <p>
                                <span className="font-medium">Bedrooms:</span> {property.bedrooms}
                              </p>
                              <p>
                                <span className="font-medium">Area:</span> {property.area} sq ft
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleApprove(property.id)}>
                              <CheckCircle className="mr-1 h-4 w-4 text-green-500" /> Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleReject(property.id)}>
                              <XCircle className="mr-1 h-4 w-4 text-red-500" /> Reject
                            </Button>
                            <Link href={`/admin/properties/${property.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="mr-1 h-4 w-4" /> Edit
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approved Properties ({approvedProperties.length})</CardTitle>
                <CardDescription>Properties visible on the website</CardDescription>
              </CardHeader>
              <CardContent>
                {approvedProperties.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No approved properties</p>
                ) : (
                  <div className="space-y-4">
                    {approvedProperties.map((property) => (
                      <div key={property.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{property.name}</h3>
                            <p className="text-sm text-gray-500">{property.location}</p>
                            <div className="mt-2 grid grid-cols-2 gap-x-4 text-sm">
                              <p>
                                <span className="font-medium">Type:</span> {property.type}
                              </p>
                              <p>
                                <span className="font-medium">Price:</span> ₹{property.price}/month
                              </p>
                              <p>
                                <span className="font-medium">Bedrooms:</span> {property.bedrooms}
                              </p>
                              <p>
                                <span className="font-medium">Area:</span> {property.area} sq ft
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link href={`/property/${property.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-1 h-4 w-4" /> View
                              </Button>
                            </Link>
                            <Link href={`/admin/properties/${property.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="mr-1 h-4 w-4" /> Edit
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Interested Users ({interestedUsers.length})</CardTitle>
              <CardDescription>Users who have expressed interest in properties</CardDescription>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-4 top-4"
                onClick={() => downloadExcel(interestedUsers, "interested-users")}
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </CardHeader>
            <CardContent>
              {interestedUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No interested users yet</p>
              ) : (
                <div className="space-y-4">
                  {interestedUsers.map((interest) => (
                    <div key={interest.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{interest.userName || interest.userEmail}</h3>
                          <p className="text-sm text-gray-500">{interest.userEmail}</p>
                          <p className="text-sm text-gray-500">
                            Phone: {interest.contactNumber || interest.userPhone || "Not provided"}
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-x-4 text-sm">
                            <p>
                              <span className="font-medium">Property:</span> {interest.propertyName}
                            </p>
                            <p>
                              <span className="font-medium">Property Type:</span>{" "}
                              {interest.propertyType || "Not specified"}
                            </p>
                            <p>
                              <span className="font-medium">Date:</span>{" "}
                              {new Date(interest.createdAt?.seconds * 1000).toLocaleDateString()}
                            </p>
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
                              <span className="font-medium">Video Tour Requested:</span>{" "}
                              {interest.videoTour ? "Yes" : "No"}
                            </p>
                            <p>
                              <span className="font-medium">Agreed to Fee:</span> {interest.agreeToFee ? "Yes" : "No"}
                            </p>
                            <p>
                              <span className="font-medium">Payment Amount:</span> ₹
                              {interest.paymentAmount || "Not specified"}
                            </p>
                            <p>
                              <span className="font-medium">Payment Status:</span> {interest.paymentStatus || "Pending"}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/property/${interest.propertyId}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-1 h-4 w-4" /> View Property
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Contact Messages</CardTitle>
              <CardDescription>Messages sent from the Contact Us page</CardDescription>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-4 top-4"
                onClick={() => downloadExcel(messages, "contact-messages")}
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No messages received yet</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{message.name}</h3>
                          <p className="text-sm text-gray-500">{message.email}</p>
                          <p className="text-sm text-gray-500">Subject: {message.subject}</p>
                          <div className="mt-2">
                            <p className="font-medium">Message:</p>
                            <p className="text-sm mt-1 whitespace-pre-line">{message.message}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Received on: {new Date(message.createdAt?.seconds * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Video Creation Requests</CardTitle>
              <CardDescription>Users who requested video creation for their properties</CardDescription>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-4 top-4"
                onClick={() => downloadExcel(videoRequests, "video-requests")}
              >
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </CardHeader>
            <CardContent>
              {videoRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No video creation requests yet</p>
              ) : (
                <div className="space-y-4">
                  {videoRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {request.name || "Property: " + request.propertyName}
                          </h3>
                          <p className="text-sm text-gray-500">Owner: {request.ownerEmail}</p>
                          <p className="text-sm text-gray-500">Contact: {request.contactNumber || "Not provided"}</p>
                          <div className="mt-2 grid grid-cols-2 gap-x-4 text-sm">
                            <p>
                              <span className="font-medium">Property Address:</span> {request.address}
                            </p>
                            <p>
                              <span className="font-medium">City:</span> {request.city}
                            </p>
                            <p>
                              <span className="font-medium">Date Requested:</span>{" "}
                              {new Date(request.createdAt?.seconds * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/admin/properties/${request.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-1 h-4 w-4" /> View Property
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>Configure system-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="upiAddress">UPI Address</Label>
                  <Input
                    id="upiAddress"
                    value={adminSettings.upiAddress}
                    onChange={(e) => setAdminSettings({ ...adminSettings, upiAddress: e.target.value })}
                    placeholder="example@upi"
                  />
                  <p className="text-sm text-gray-500 mt-1">This UPI address will be used for all interest payments</p>
                </div>

                <div>
                  <Label htmlFor="interestFee">Interest Fee (₹)</Label>
                  <Input
                    id="interestFee"
                    value={adminSettings.interestFee}
                    onChange={(e) => setAdminSettings({ ...adminSettings, interestFee: e.target.value })}
                    type="number"
                  />
                  <p className="text-sm text-gray-500 mt-1">Amount users will pay to express interest in a property</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Rent-wise Interest Fees</h3>
                  <div className="space-y-3">
                    {rentRanges.map((range, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          {index + 1}
                        </div>
                        <span className="w-48">{range}</span>
                        <div className="flex items-center">
                          <span className="mr-2">₹</span>
                          <Input
                            type="number"
                            value={adminSettings.rentWiseFees?.[index] || adminSettings.interestFee}
                            onChange={(e) => {
                              const newFees = { ...(adminSettings.rentWiseFees || {}) }
                              newFees[index] = e.target.value
                              setAdminSettings({
                                ...adminSettings,
                                rentWiseFees: newFees,
                              })
                            }}
                            className="w-24"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

