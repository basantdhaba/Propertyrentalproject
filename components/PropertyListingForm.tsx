"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { addDocument } from "@/lib/firebase"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Home } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Form schema with validation
const formSchema = z.object({
  // Property Details
  name: z.string().min(1, "Property name is required"),
  propertyType: z.string().min(1, "Property type is required"),
  totalBuildingFloor: z.string().min(1, "Total building floor is required"),
  rentFloor: z.string().min(1, "Number of rent floor is required"),
  address: z.string().min(5, "Address is required"),
  area: z.string().min(1, "Area is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  bedrooms: z.string().min(1, "Number of bedrooms is required"),
  bathrooms: z.string().min(1, "Number of bathrooms is required"),

  // Rental Preferences
  rentTo: z.string().min(1, "Rental preference is required"),
  familySize: z.string().optional(),
  monthlyRent: z.string().min(1, "Monthly rent is required"),
  maintenanceCharges: z.string().optional(),
  securityDeposit: z.string().min(1, "Security deposit is required"),
  petsAllowed: z.boolean().default(false),
  religionPreference: z.boolean().default(false),
  specificReligion: z.string().optional(),

  // Video & Contact Details
  videoLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  createVideo: z.boolean().default(false),
  contactNumber: z.string().regex(/^\d{10}$/, "Contact number must be 10 digits"),

  // Additional Details
  description: z.string().min(10, "Description is required"),
  amenities: z.string().optional(),
  availableFrom: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function PropertyListingForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      propertyType: "",
      totalBuildingFloor: "",
      rentFloor: "",
      address: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      bedrooms: "",
      bathrooms: "",
      rentTo: "",
      familySize: "",
      monthlyRent: "",
      maintenanceCharges: "",
      securityDeposit: "",
      petsAllowed: false,
      religionPreference: false,
      specificReligion: "",
      videoLink: "",
      createVideo: false,
      contactNumber: "",
      description: "",
      amenities: "",
      availableFrom: "",
    },
  })

  const {
    watch,
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = form

  // Watch for conditional fields
  const rentTo = watch("rentTo")
  const religionPreference = watch("religionPreference")
  const videoLink = watch("videoLink")

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      setError("You must be logged in to list a property")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Prepare property data
      const propertyData = {
        ...data,
        owner: user.uid,
        ownerEmail: user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "pending",
        // Add compatibility fields for dashboard display
        price: data.monthlyRent,
        youtubeUrl: data.videoLink,
        type: data.propertyType,
        location: `${data.city}, ${data.state}`,
      }

      // Add to Firestore
      const { error } = await addDocument("properties", propertyData)
      if (error) throw new Error(error)

      setSuccess(true)

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
            <Home className="h-6 w-6" />
            List Your Property
          </CardTitle>
          <CardDescription>
            Fill out the form below to list your property. It will be reviewed by our admin before being published.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your property has been submitted successfully and is pending review. You will be redirected to your
                  dashboard shortly.
                </AlertDescription>
              </Alert>
            )}

            {/* Section 1: Property Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">1️⃣ Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Property Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                    placeholder="e.g. 2BHK Apartment"
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyType">
                    Property Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("propertyType", value)}
                    defaultValue={form.getValues("propertyType")}
                  >
                    <SelectTrigger id="propertyType" className={errors.propertyType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="independentHouse">Independent House</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="pg">PG/Hostel</SelectItem>
                      <SelectItem value="flatmate">Flatmate</SelectItem>
                      <SelectItem value="commercial">Commercial Space</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.propertyType && <p className="text-red-500 text-sm">{errors.propertyType.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalBuildingFloor">
                    Total Building Floor <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="totalBuildingFloor"
                    {...register("totalBuildingFloor")}
                    className={errors.totalBuildingFloor ? "border-red-500" : ""}
                    placeholder="e.g. 5"
                    type="number"
                  />
                  {errors.totalBuildingFloor && (
                    <p className="text-red-500 text-sm">{errors.totalBuildingFloor.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rentFloor">
                    Number of Rent Floor <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rentFloor"
                    {...register("rentFloor")}
                    className={errors.rentFloor ? "border-red-500" : ""}
                    placeholder="e.g. 2"
                    type="number"
                  />
                  {errors.rentFloor && <p className="text-red-500 text-sm">{errors.rentFloor.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">
                    Area Carpet (sq. ft.) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="area"
                    {...register("area")}
                    className={errors.area ? "border-red-500" : ""}
                    placeholder="e.g. 1200"
                  />
                  {errors.area && <p className="text-red-500 text-sm">{errors.area.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">
                    Bedrooms <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bedrooms"
                    {...register("bedrooms")}
                    className={errors.bedrooms ? "border-red-500" : ""}
                    placeholder="e.g. 2"
                    type="number"
                  />
                  {errors.bedrooms && <p className="text-red-500 text-sm">{errors.bedrooms.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">
                    Bathrooms <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bathrooms"
                    {...register("bathrooms")}
                    className={errors.bathrooms ? "border-red-500" : ""}
                    placeholder="e.g. 2"
                    type="number"
                  />
                  {errors.bathrooms && <p className="text-red-500 text-sm">{errors.bathrooms.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    {...register("address")}
                    className={errors.address ? "border-red-500" : ""}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                  {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    {...register("city")}
                    className={errors.city ? "border-red-500" : ""}
                    placeholder="e.g. Mumbai"
                  />
                  {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="state"
                    {...register("state")}
                    className={errors.state ? "border-red-500" : ""}
                    placeholder="e.g. Maharashtra"
                  />
                  {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">
                    Pincode <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pincode"
                    {...register("pincode")}
                    className={errors.pincode ? "border-red-500" : ""}
                    placeholder="e.g. 400001"
                    maxLength={6}
                  />
                  {errors.pincode && <p className="text-red-500 text-sm">{errors.pincode.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableFrom">
                    Available From <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="availableFrom"
                    type="date"
                    {...register("availableFrom")}
                    className={errors.availableFrom ? "border-red-500" : ""}
                  />
                  {errors.availableFrom && <p className="text-red-500 text-sm">{errors.availableFrom.message}</p>}
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 2: Rental Preferences */}
            <div>
              <h3 className="text-lg font-semibold mb-4">2️⃣ Rental Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rentTo">
                    Willing to Rent To <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={(value) => setValue("rentTo", value)} defaultValue={form.getValues("rentTo")}>
                    <SelectTrigger id="rentTo" className={errors.rentTo ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="singleStudent">Single (Student)</SelectItem>
                      <SelectItem value="singleProfessional">Single (Working Professional)</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="anyone">Anyone</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.rentTo && <p className="text-red-500 text-sm">{errors.rentTo.message}</p>}
                </div>

                {rentTo === "family" && (
                  <div className="space-y-2">
                    <Label htmlFor="familySize">
                      Family Size <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="familySize"
                      {...register("familySize")}
                      className={errors.familySize ? "border-red-500" : ""}
                      placeholder="e.g. 4"
                      type="number"
                    />
                    {errors.familySize && <p className="text-red-500 text-sm">{errors.familySize.message}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">
                    Monthly Rent (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="monthlyRent"
                    {...register("monthlyRent")}
                    className={errors.monthlyRent ? "border-red-500" : ""}
                    placeholder="e.g. 15000"
                    type="number"
                  />
                  {errors.monthlyRent && <p className="text-red-500 text-sm">{errors.monthlyRent.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenanceCharges">Maintenance Charges (₹)</Label>
                  <Input
                    id="maintenanceCharges"
                    {...register("maintenanceCharges")}
                    className={errors.maintenanceCharges ? "border-red-500" : ""}
                    placeholder="e.g. 2000"
                    type="number"
                  />
                  {errors.maintenanceCharges && (
                    <p className="text-red-500 text-sm">{errors.maintenanceCharges.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="securityDeposit">
                    Security Deposit (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="securityDeposit"
                    {...register("securityDeposit")}
                    className={errors.securityDeposit ? "border-red-500" : ""}
                    placeholder="e.g. 50000"
                    type="number"
                  />
                  {errors.securityDeposit && <p className="text-red-500 text-sm">{errors.securityDeposit.message}</p>}
                </div>

                <div className="space-y-2 flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="petsAllowed" className="block mb-2">
                      Pets Allowed?
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="petsAllowed"
                        checked={form.watch("petsAllowed")}
                        onCheckedChange={(checked) => setValue("petsAllowed", checked)}
                      />
                      <Label htmlFor="petsAllowed" className="cursor-pointer">
                        {form.watch("petsAllowed") ? "Yes" : "No"}
                      </Label>
                    </div>
                  </div>

                  <div className="flex-1">
                    <Label htmlFor="religionPreference" className="block mb-2">
                      Religion-Specific Preference?
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="religionPreference"
                        checked={form.watch("religionPreference")}
                        onCheckedChange={(checked) => setValue("religionPreference", checked)}
                      />
                      <Label htmlFor="religionPreference" className="cursor-pointer">
                        {form.watch("religionPreference") ? "Yes" : "No"}
                      </Label>
                    </div>
                  </div>
                </div>

                {religionPreference && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="specificReligion">Specify Religion Preference</Label>
                    <Select
                      onValueChange={(value) => setValue("specificReligion", value)}
                      defaultValue={form.getValues("specificReligion")}
                    >
                      <SelectTrigger id="specificReligion">
                        <SelectValue placeholder="Select religion preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hindu">Hindu</SelectItem>
                        <SelectItem value="muslim">Muslim</SelectItem>
                        <SelectItem value="christian">Christian</SelectItem>
                        <SelectItem value="sikh">Sikh</SelectItem>
                        <SelectItem value="jain">Jain</SelectItem>
                        <SelectItem value="buddhist">Buddhist</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Section 3: Video & Contact Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">3️⃣ Video & Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="videoLink">Video Link (YouTube/Vimeo)</Label>
                  <Input
                    id="videoLink"
                    {...register("videoLink")}
                    className={errors.videoLink ? "border-red-500" : ""}
                    placeholder="e.g. https://youtube.com/watch?v=..."
                  />
                  {errors.videoLink && <p className="text-red-500 text-sm">{errors.videoLink.message}</p>}
                </div>

                {!videoLink && (
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="createVideo"
                        checked={form.watch("createVideo")}
                        onCheckedChange={(checked) => setValue("createVideo", checked as boolean)}
                      />
                      <Label htmlFor="createVideo" className="cursor-pointer">
                        I want the team to create a video for me (Charges Apply)
                      </Label>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">
                    Owner's WhatsApp/Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactNumber"
                    {...register("contactNumber")}
                    className={errors.contactNumber ? "border-red-500" : ""}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                  />
                  {errors.contactNumber && <p className="text-red-500 text-sm">{errors.contactNumber.message}</p>}
                  <p className="text-sm text-gray-500">This will only be visible to admin, not to others</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Property Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    className={errors.description ? "border-red-500" : ""}
                    placeholder="Describe your property, including key features, nearby landmarks, etc."
                    rows={4}
                  />
                  {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amenities">Amenities</Label>
                  <Textarea
                    id="amenities"
                    {...register("amenities")}
                    className={errors.amenities ? "border-red-500" : ""}
                    placeholder="List amenities like parking, lift, gym, swimming pool, etc."
                    rows={3}
                  />
                  {errors.amenities && <p className="text-red-500 text-sm">{errors.amenities.message}</p>}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between">
            <p className="text-sm text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </p>
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[120px]">
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Submitting...
                  </>
                ) : (
                  "Submit Listing"
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

