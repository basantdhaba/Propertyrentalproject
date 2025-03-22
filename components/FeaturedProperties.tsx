"use client"

import { useState, useEffect } from "react"
import { getDocumentsByField } from "@/lib/firebase"
import { Search, Home, Bath, User, Calendar, MapPin, Filter, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    pinCode: "",
    maxRent: "",
    bedrooms: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  // Array of background colors for property cards
  const bgColors = [
    "bg-blue-100",
    "bg-green-100",
    "bg-purple-100",
    "bg-pink-100",
    "bg-yellow-100",
    "bg-indigo-100",
    "bg-teal-100",
    "bg-orange-100",
  ]

  const getYouTubeVideoId = (url: string) => {
    if (!url) return ""

    // Handle different YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)

    return match && match[2].length === 11 ? match[2] : ""
  }

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await getDocumentsByField("properties", "status", "approved")
        if (error) {
          setError(error)
        } else {
          console.log("Approved properties:", data)
          setProperties(data)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const clearFilters = () => {
    setFilters({
      pinCode: "",
      maxRent: "",
      bedrooms: "",
    })
    setSearchQuery("")
  }

  // Update the handlePropertyClick function to allow authorized users to access property details
  const handlePropertyClick = (propertyId: string) => {
    if (user) {
      router.push(`/property/${propertyId}`)
    } else {
      router.push(`/login?redirect=/property/${propertyId}`)
    }
  }

  const filteredProperties = properties.filter((property) => {
    let matches = true

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const searchableFields = [
        property.name,
        property.location,
        property.address,
        property.city,
        property.zip,
        property.description,
      ]
        .filter(Boolean)
        .map((field) => field.toLowerCase())

      matches = matches && searchableFields.some((field) => field.includes(query))
    }

    if (filters.pinCode && property.zip) {
      matches = matches && property.zip.includes(filters.pinCode)
    }

    if (filters.maxRent && property.price) {
      matches = matches && Number.parseInt(property.price) <= Number.parseInt(filters.maxRent)
    }

    if (filters.bedrooms && property.bedrooms) {
      matches = matches && property.bedrooms.toString() === filters.bedrooms
    }

    return matches
  })

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )

  if (error)
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Error: {error}</div>

  return (
    <section className="py-8 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center text-2xl md:text-3xl font-bold">Featured Properties</h2>

        {/* Mobile and Desktop Search */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Mobile Filters */}
          <div className="flex md:hidden justify-end">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Filter Properties</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">PIN Code</label>
                    <input
                      type="text"
                      placeholder="Enter PIN code"
                      value={filters.pinCode}
                      onChange={(e) => setFilters({ ...filters, pinCode: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Maximum Rent</label>
                    <input
                      type="text"
                      placeholder="Enter maximum rent"
                      value={filters.maxRent}
                      onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bedrooms</label>
                    <select
                      value={filters.bedrooms}
                      onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                      <option value="">Any</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={clearFilters} className="gap-2">
                      <X className="h-4 w-4" />
                      Clear
                    </Button>
                    <Button>Apply Filters</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-2">
            <input
              type="text"
              placeholder="PIN Code"
              value={filters.pinCode}
              onChange={(e) => setFilters({ ...filters, pinCode: e.target.value })}
              className="w-24 lg:w-32 rounded-md border border-gray-300 px-3 py-2"
            />
            <input
              type="text"
              placeholder="Max Rent"
              value={filters.maxRent}
              onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
              className="w-24 lg:w-32 rounded-md border border-gray-300 px-3 py-2"
            />
            <select
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Bedrooms</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </select>
            <button
              onClick={clearFilters}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
            <button className="rounded-md bg-teal-500 px-3 py-2 text-white hover:bg-teal-600">Set Notifications</button>
          </div>
        </div>

        {/* Property Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No properties found matching your criteria.</p>
            </div>
          ) : (
            filteredProperties.map((property, index) => (
              <div
                key={property.id}
                className={`${bgColors[index % bgColors.length]} overflow-hidden rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105`}
                onClick={() => handlePropertyClick(property.id)}
              >
                <div className="p-4 md:p-6">
                  <div className="mb-3">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-1">{property.name}</h3>
                    <span className="inline-block rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-800 mt-1">
                      {property.type || "Apartment"}
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

                  {property.youtubeUrl && (
                    <div
                      className="mt-2 mb-3 relative cursor-pointer overflow-hidden rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!user) {
                          // Redirect to login if user is not logged in
                          router.push(`/login?redirect=/property/${property.id}`)
                        } else {
                          window.open(property.youtubeUrl, "_blank")
                        }
                      }}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${getYouTubeVideoId(property.youtubeUrl)}/0.jpg`}
                        alt="Video thumbnail"
                        className="w-full h-32 object-cover"
                      />
                      {!user && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-white text-center p-2">
                            <p className="text-sm font-medium">Login to view video</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-600 rounded-full p-2 opacity-80">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900">
                      ₹ {property.price || "Price not specified"}
                      <span className="text-xs font-normal text-gray-700">/month</span>
                    </div>
                    <button className="rounded-md bg-blue-600 px-3 py-1.5 text-xs md:text-sm text-white hover:bg-blue-700">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

