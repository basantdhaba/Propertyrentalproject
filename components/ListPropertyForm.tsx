"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createDocument, uploadFile } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export default function ListPropertyForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    price: "",
    location: "",
    description: "",
    availableFrom: "",
    grade: "A",
    youtubeUrl: "",
    totalBuildingFloor: "",
    rentFloor: "",
    maintenanceCharges: "",
    securityDeposit: "",
    rentTo: "",
    petsAllowed: false,
    religionPreference: false,
    specificReligion: "",
    contactNumber: "",
    amenities: "",
  })
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError("You must be logged in to list a property")
      return
    }
    setLoading(true)
    setError("")

    try {
      let imageUrl = ""
      if (image) {
        const { url, error } = await uploadFile(image, `properties/${Date.now()}_${image.name}`)
        if (error) throw new Error(error)
        imageUrl = url!
      }

      const propertyData = {
        ...formData,
        imageUrl,
        owner: user.uid,
        ownerEmail: user.email,
        status: "pending", // All properties start as pending
        interested: [],
        createdAt: new Date(),
      }

      const { id, error } = await createDocument("properties", propertyData)
      if (error) throw new Error(error)

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>List Your Property</CardTitle>
        <CardDescription>
          Fill out the form below to list your property. It will be reviewed by our admin before being published.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Property Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="office">Office Space</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalBuildingFloor">Total Building Floor</Label>
              <Input
                id="totalBuildingFloor"
                name="totalBuildingFloor"
                type="number"
                value={formData.totalBuildingFloor}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rentFloor">Number of Rent Floor</Label>
              <Input
                id="rentFloor"
                name="rentFloor"
                type="number"
                value={formData.rentFloor}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area (sq ft)</Label>
              <Input id="area" name="area" type="number" value={formData.area} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Monthly Rent (₹)</Label>
              <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenanceCharges">Maintenance Charges (₹)</Label>
              <Input
                id="maintenanceCharges"
                name="maintenanceCharges"
                type="number"
                value={formData.maintenanceCharges}
                onChange={handleChange}
                placeholder="e.g. 2000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityDeposit">Security Deposit (₹)</Label>
              <Input
                id="securityDeposit"
                name="securityDeposit"
                type="number"
                value={formData.securityDeposit}
                onChange={handleChange}
                required
                placeholder="e.g. 50000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rentTo">Willing to Rent To</Label>
              <Select value={formData.rentTo} onValueChange={(value) => handleSelectChange("rentTo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="singleStudent">Single (Student)</SelectItem>
                  <SelectItem value="singleProfessional">Single (Working Professional)</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="anyone">Anyone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="petsAllowed" className="block mb-2">
                  Pets Allowed?
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="petsAllowed"
                    checked={formData.petsAllowed}
                    onCheckedChange={(checked) => setFormData({ ...formData, petsAllowed: checked })}
                  />
                  <Label htmlFor="petsAllowed" className="cursor-pointer">
                    {formData.petsAllowed ? "Yes" : "No"}
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
                    checked={formData.religionPreference}
                    onCheckedChange={(checked) => setFormData({ ...formData, religionPreference: checked })}
                  />
                  <Label htmlFor="religionPreference" className="cursor-pointer">
                    {formData.religionPreference ? "Yes" : "No"}
                  </Label>
                </div>
              </div>
            </div>

            {formData.religionPreference && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="specificReligion">Specify Religion Preference</Label>
                <Select
                  value={formData.specificReligion}
                  onValueChange={(value) => handleSelectChange("specificReligion", value)}
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

            <div className="space-y-2">
              <Label htmlFor="availableFrom">Available From</Label>
              <Input
                id="availableFrom"
                name="availableFrom"
                type="date"
                value={formData.availableFrom}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Property Grade</Label>
              <Select value={formData.grade} onValueChange={(value) => handleSelectChange("grade", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Grade A</SelectItem>
                  <SelectItem value="B">Grade B</SelectItem>
                  <SelectItem value="C">Grade C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="image">Property Image</Label>
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Owner's WhatsApp/Phone Number</Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                maxLength={10}
                required
              />
              <p className="text-xs text-gray-500">This will only be visible to admin, not to others</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="youtubeUrl">YouTube Video URL (optional)</Label>
              <Input
                id="youtubeUrl"
                name="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-500">Add a YouTube video tour of your property</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amenities">Amenities</Label>
            <Textarea
              id="amenities"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="List amenities like parking, lift, gym, swimming pool, etc."
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "List Property"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

