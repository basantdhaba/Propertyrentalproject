"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getAllUsers, getDocumentsByDateRange } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Download, Calendar, Filter, FileSpreadsheet } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import * as XLSX from "xlsx"

export default function ReportsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("properties")

  // Date filters
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Data sources
  const [properties, setProperties] = useState<any[]>([])
  const [interests, setInterests] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [todayCollections, setTodayCollections] = useState<any[]>([])

  // Field selection checkboxes
  const [selectedPropertyFields, setSelectedPropertyFields] = useState({
    id: true,
    name: true,
    address: true,
    city: true,
    state: true,
    bedrooms: true,
    bathrooms: true,
    price: true,
    status: true,
    createdAt: true,
    ownerEmail: true,
    contactNumber: true,
    type: true,
    area: true,
    availableFrom: true,
    rentTo: true,
    petsAllowed: true,
    religionPreference: true,
    specificReligion: false,
    description: false,
    amenities: false,
  })

  const [selectedInterestFields, setSelectedInterestFields] = useState({
    id: true,
    propertyId: true,
    propertyName: true,
    userId: true,
    userEmail: true,
    contactNumber: true,
    religion: true,
    occupation: true,
    maritalStatus: true,
    createdAt: true,
    paymentStatus: true,
    paymentAmount: true,
    videoTour: true,
    familyMembers: false,
    ageGroup: false,
    studentOrWorking: false,
  })

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login?redirect=/admin/reports")
    }
  }, [user, loading, isAdmin, router])

  // Set today's date as default end date
  useEffect(() => {
    const today = new Date()
    const formattedDate = today.toISOString().split("T")[0]
    setEndDate(formattedDate)

    // Set start date to 30 days ago by default
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0])
  }, [])

  const fetchData = async () => {
    setGenerating(true)
    setError(null)

    try {
      // Convert dates to Date objects for filtering
      const startDateObj = startDate ? new Date(startDate) : new Date(0)
      const endDateObj = endDate ? new Date(endDate) : new Date()

      // Set end date to end of day
      endDateObj.setHours(23, 59, 59, 999)

      // Fetch properties within date range
      const { data: propertiesData, error: propertiesError } = await getDocumentsByDateRange(
        "properties",
        "createdAt",
        startDateObj,
        endDateObj,
      )

      if (propertiesError) throw new Error(propertiesError)
      setProperties(propertiesData)

      // Fetch interests within date range
      const { data: interestsData, error: interestsError } = await getDocumentsByDateRange(
        "interests",
        "createdAt",
        startDateObj,
        endDateObj,
      )

      if (interestsError) throw new Error(interestsError)
      setInterests(interestsData)

      // Fetch users
      const { data: usersData, error: usersError } = await getAllUsers()
      if (usersError) throw new Error(usersError)
      setUsers(usersData)

      // Fetch today's collections
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)

      const { data: todayInterests, error: todayError } = await getDocumentsByDateRange(
        "interests",
        "createdAt",
        today,
        todayEnd,
      )

      if (todayError) throw new Error(todayError)

      // Filter to only include interests with payment status "completed"
      const completedPayments = todayInterests.filter(
        (interest) => interest.paymentStatus === "completed" || interest.paymentStatus === "paid",
      )

      setTodayCollections(completedPayments)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const generateExcel = (data: any[], filename: string, selectedFields: Record<string, boolean>) => {
    // Filter data to only include selected fields
    const filteredData = data.map((item) => {
      const filteredItem: Record<string, any> = {}

      Object.keys(selectedFields).forEach((field) => {
        if (selectedFields[field] && item[field] !== undefined) {
          // Format dates if the field is a date
          if (field === "createdAt" || field === "updatedAt" || field === "availableFrom") {
            if (item[field] && typeof item[field] === "object" && item[field].seconds) {
              // Handle Firestore timestamp
              filteredItem[field] = new Date(item[field].seconds * 1000).toLocaleDateString()
            } else if (item[field] instanceof Date) {
              filteredItem[field] = item[field].toLocaleDateString()
            } else if (typeof item[field] === "string" && !isNaN(Date.parse(item[field]))) {
              filteredItem[field] = new Date(item[field]).toLocaleDateString()
            } else {
              filteredItem[field] = item[field]
            }
          } else {
            // Handle boolean values
            if (typeof item[field] === "boolean") {
              filteredItem[field] = item[field] ? "Yes" : "No"
            } else {
              filteredItem[field] = item[field]
            }
          }
        }
      })

      return filteredItem
    })

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredData)

    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data")

    // Generate Excel file
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const handleGeneratePropertiesReport = () => {
    generateExcel(properties, "properties_report", selectedPropertyFields)
  }

  const handleGenerateInterestsReport = () => {
    // Enrich interest data with property and user details
    const enrichedInterests = interests.map((interest) => {
      // Find matching property
      const property = properties.find((p) => p.id === interest.propertyId) || {}

      // Find matching user
      const user = users.find((u) => u.id === interest.userId) || {}

      return {
        ...interest,
        propertyAddress: property.address,
        propertyCity: property.city,
        propertyState: property.state,
        propertyBedrooms: property.bedrooms,
        propertyPrice: property.price || property.monthlyRent,
        userName: user.name,
        userEmail: user.email,
      }
    })

    // Add additional fields to selected fields
    const enrichedFields = {
      ...selectedInterestFields,
      propertyAddress: true,
      propertyCity: true,
      propertyState: true,
      propertyBedrooms: true,
      propertyPrice: true,
      userName: true,
    }

    generateExcel(enrichedInterests, "interests_report", enrichedFields)
  }

  const handleGenerateTodayCollectionsReport = () => {
    // Calculate total collection amount
    const totalAmount = todayCollections.reduce((sum, item) => sum + Number(item.paymentAmount || 0), 0)

    // Add a summary row
    const collectionsWithSummary = [
      ...todayCollections,
      {
        id: "TOTAL",
        propertyName: "TOTAL COLLECTIONS",
        paymentAmount: totalAmount,
        paymentStatus: "SUMMARY",
      },
    ]

    generateExcel(collectionsWithSummary, "today_collections", {
      id: true,
      propertyId: true,
      propertyName: true,
      userEmail: true,
      paymentAmount: true,
      paymentStatus: true,
      createdAt: true,
    })
  }

  const toggleAllPropertyFields = (value: boolean) => {
    const updatedFields = { ...selectedPropertyFields }
    Object.keys(updatedFields).forEach((key) => {
      updatedFields[key as keyof typeof selectedPropertyFields] = value
    })
    setSelectedPropertyFields(updatedFields)
  }

  const toggleAllInterestFields = (value: boolean) => {
    const updatedFields = { ...selectedInterestFields }
    Object.keys(updatedFields).forEach((key) => {
      updatedFields[key as keyof typeof selectedInterestFields] = value
    })
    setSelectedInterestFields(updatedFields)
  }

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
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            Admin Reports
          </CardTitle>
          <CardDescription>
            Generate and download Excel reports for properties, interests, and collections
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-medium">Date Range Filter</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button onClick={fetchData} disabled={generating} className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  {generating ? "Loading..." : "Fetch Data"}
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="properties" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="properties">Properties Report</TabsTrigger>
              <TabsTrigger value="interests">Interests Report</TabsTrigger>
              <TabsTrigger value="collections">Today's Collections</TabsTrigger>
            </TabsList>

            <TabsContent value="properties">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Properties Report</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleAllPropertyFields(true)}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toggleAllPropertyFields(false)}>
                        Deselect All
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                    {Object.keys(selectedPropertyFields).map((field) => (
                      <div key={field} className="flex items-center space-x-2">
                        <Checkbox
                          id={`property-${field}`}
                          checked={selectedPropertyFields[field as keyof typeof selectedPropertyFields]}
                          onCheckedChange={(checked) => {
                            setSelectedPropertyFields({
                              ...selectedPropertyFields,
                              [field]: !!checked,
                            })
                          }}
                        />
                        <Label htmlFor={`property-${field}`} className="capitalize">
                          {field}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{properties.length} properties found in selected date range</p>
                  </div>
                  <Button
                    onClick={handleGeneratePropertiesReport}
                    disabled={properties.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Properties Report
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="interests">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Interests Report</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleAllInterestFields(true)}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toggleAllInterestFields(false)}>
                        Deselect All
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                    {Object.keys(selectedInterestFields).map((field) => (
                      <div key={field} className="flex items-center space-x-2">
                        <Checkbox
                          id={`interest-${field}`}
                          checked={selectedInterestFields[field as keyof typeof selectedInterestFields]}
                          onCheckedChange={(checked) => {
                            setSelectedInterestFields({
                              ...selectedInterestFields,
                              [field]: !!checked,
                            })
                          }}
                        />
                        <Label htmlFor={`interest-${field}`} className="capitalize">
                          {field}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{interests.length} interests found in selected date range</p>
                  </div>
                  <Button
                    onClick={handleGenerateInterestsReport}
                    disabled={interests.length === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Interests Report
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="collections">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Today's Collections Report</h3>

                  {todayCollections.length === 0 ? (
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <p className="text-gray-500">No collections found for today</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Property
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {todayCollections.map((collection) => (
                            <tr key={collection.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{collection.propertyName}</div>
                                <div className="text-sm text-gray-500">{collection.propertyId}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{collection.userEmail}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">₹{collection.paymentAmount}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {collection.paymentStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {collection.createdAt instanceof Date
                                  ? collection.createdAt.toLocaleTimeString()
                                  : new Date(collection.createdAt?.seconds * 1000).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50 font-bold">
                            <td className="px-6 py-4 whitespace-nowrap" colSpan={2}>
                              Total Collections
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-green-600">
                              ₹{todayCollections.reduce((sum, item) => sum + Number(item.paymentAmount || 0), 0)}
                            </td>
                            <td colSpan={2}></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleGenerateTodayCollectionsReport}
                    disabled={todayCollections.length === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Today's Collections
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

