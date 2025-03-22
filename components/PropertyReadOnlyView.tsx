import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Home, MapPin, User, DollarSign } from "lucide-react"

type PropertyReadOnlyViewProps = {
  property: any
}

export default function PropertyReadOnlyView({ property }: PropertyReadOnlyViewProps) {
  // Format date if it exists
  const formatDate = (dateValue: any) => {
    if (!dateValue) return "Not specified"

    let date
    if (typeof dateValue === "string") {
      date = new Date(dateValue)
    } else if (dateValue.seconds) {
      // Handle Firestore timestamp
      date = new Date(dateValue.seconds * 1000)
    } else {
      date = new Date(dateValue)
    }

    if (isNaN(date.getTime())) return "Not specified"

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Ensure we have the correct property fields regardless of which form was used
  const propertyData = {
    name: property.name || "",
    type: property.propertyType || property.type || "",
    totalBuildingFloor: property.totalBuildingFloor || "",
    rentFloor: property.rentFloor || "",
    bedrooms: property.bedrooms || "",
    bathrooms: property.bathrooms || "",
    area: property.area || "",
    price: property.monthlyRent || property.price || "",
    location: property.location || `${property.city || ""}, ${property.state || ""}`,
    description: property.description || "",
    availableFrom: formatDate(property.availableFrom),
    status: property.status || "pending",
    ownerEmail: property.ownerEmail || "",
    contactNumber: property.contactNumber || "",
    createdAt: formatDate(property.createdAt),
    amenities: property.amenities || "",
    videoLink: property.videoLink || property.youtubeUrl || "",
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{propertyData.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {propertyData.location}
            </CardDescription>
          </div>
          <Badge
            className={
              propertyData.status === "approved"
                ? "bg-green-100 text-green-800"
                : propertyData.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
            }
          >
            {propertyData.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Property Details */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Home className="h-5 w-5 mr-2" />
            Property Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Property Type</p>
              <p>{propertyData.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Building Floor</p>
              <p>{propertyData.totalBuildingFloor || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rent Floor</p>
              <p>{propertyData.rentFloor || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bedrooms</p>
              <p>{propertyData.bedrooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bathrooms</p>
              <p>{propertyData.bathrooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Area</p>
              <p>{propertyData.area} sq ft</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available From</p>
              <p>{propertyData.availableFrom}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Rental Details */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Rental Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Monthly Rent</p>
              <p>₹{propertyData.price}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Security Deposit</p>
              <p>₹{property.securityDeposit || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Maintenance Charges</p>
              <p>₹{property.maintenanceCharges || "Not specified"}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Owner Details */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Owner Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{propertyData.ownerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact Number</p>
              <p>{propertyData.contactNumber || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Listed On</p>
              <p>{propertyData.createdAt}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Description</h3>
          <p className="whitespace-pre-line">{propertyData.description}</p>
        </div>

        {/* Amenities */}
        {propertyData.amenities && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Amenities</h3>
            <p className="whitespace-pre-line">{propertyData.amenities}</p>
          </div>
        )}

        {/* Video Link */}
        {propertyData.videoLink && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Video Tour</h3>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={propertyData.videoLink.replace("watch?v=", "embed/")}
                title="Property Video Tour"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

