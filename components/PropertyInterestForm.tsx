"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { addDocument, getDocument, getAdminSettings } from "@/lib/firebase"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Form schema with validation
const formSchema = z.object({
  religion: z.string().min(1, "Religion is required"),
  occupation: z.string().min(1, "Occupation is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  familyMembers: z.string().optional(),
  ageGroup: z.string().optional(),
  studentOrWorking: z.string().optional(),
  contactNumber: z.string().regex(/^\d{10}$/, "Contact number must be 10 digits"),
  videoTour: z.boolean().default(false),
  agreeToFee: z.boolean().refine((val) => val === true, {
    message: "You must agree to pay the consultant fee",
  }),
})

type FormValues = z.infer<typeof formSchema>

type PropertyInterestFormProps = {
  propertyId: string
  propertyName: string
  onClose: () => void
}

export default function PropertyInterestForm({ propertyId, propertyName, onClose }: PropertyInterestFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [property, setProperty] = useState<any>(null)
  const [adminSettings, setAdminSettings] = useState<any>(null)
  const [feeAmount, setFeeAmount] = useState<string>("0")

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      religion: "",
      occupation: "",
      maritalStatus: "",
      familyMembers: "",
      ageGroup: "",
      studentOrWorking: "",
      contactNumber: "",
      videoTour: false,
      agreeToFee: false,
    },
  })

  // Fetch property details to get the rent amount and admin settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch property details
        const { data, error } = await getDocument("properties", propertyId)
        if (error) throw new Error(error)
        if (data) {
          setProperty(data)

          // Fetch admin settings for fee structure
          const { data: settingsData } = await getAdminSettings()
          if (settingsData) {
            setAdminSettings(settingsData)

            // Determine fee based on rent range
            const rent = Number.parseInt(data.monthlyRent || data.price || "0")
            let fee = settingsData.interestFee || "0"

            // Apply rent-wise fee structure if available
            if (settingsData.rentWiseFees && Object.keys(settingsData.rentWiseFees).length > 0) {
              if (rent <= 10000) {
                fee = settingsData.rentWiseFees[0] || fee
              } else if (rent <= 20000) {
                fee = settingsData.rentWiseFees[1] || fee
              } else if (rent <= 35000) {
                fee = settingsData.rentWiseFees[2] || fee
              } else if (rent <= 50000) {
                fee = settingsData.rentWiseFees[3] || fee
              } else if (rent <= 100000) {
                fee = settingsData.rentWiseFees[4] || fee
              } else {
                fee = settingsData.rentWiseFees[5] || fee
              }
            }

            setFeeAmount(fee)
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      }
    }

    fetchData()
  }, [propertyId])

  const {
    setValue,
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = form

  // Watch marital status to conditionally show fields
  const maritalStatus = watch("maritalStatus")

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      setError("You must be logged in to express interest")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Prepare interest data
      const interestData = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || "",
        userPhone: data.contactNumber,
        propertyId,
        propertyName,
        propertyType: property?.propertyType || property?.type || "",
        religion: data.religion,
        occupation: data.occupation,
        maritalStatus: data.maritalStatus,
        familyMembers: data.familyMembers || "",
        ageGroup: data.ageGroup || "",
        studentOrWorking: data.studentOrWorking || "",
        contactNumber: data.contactNumber,
        videoTour: data.videoTour,
        agreeToFee: data.agreeToFee,
        createdAt: new Date(),
        status: "pending",
        paymentStatus: "pending",
        paymentAmount: feeAmount,
        monthlyRent: property?.monthlyRent || property?.price || "0",
      }

      console.log("Submitting interest data:", interestData)

      // Add to Firestore
      const { error } = await addDocument("interests", interestData)
      if (error) throw new Error(error)

      // Redirect to payment page or dashboard
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  // Calculate monthly rent from property data
  const monthlyRent = property?.monthlyRent || property?.price || "0"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">Express Interest in Property</h2>
          <p className="text-sm text-gray-600 mb-6">Fill out this form to express your interest in this property.</p>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="religion" className="block mb-1">
                Religion <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => setValue("religion", value)}>
                <SelectTrigger id="religion" className={errors.religion ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select religion" />
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
              {errors.religion && <p className="text-red-500 text-sm mt-1">{errors.religion.message}</p>}
            </div>

            <div>
              <Label htmlFor="occupation" className="block mb-1">
                Occupation <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => setValue("occupation", value)}>
                <SelectTrigger id="occupation" className={errors.occupation ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select occupation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="private">Private Job</SelectItem>
                  <SelectItem value="government">Government Job</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="selfEmployed">Self Employed</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.occupation && <p className="text-red-500 text-sm mt-1">{errors.occupation.message}</p>}
            </div>

            <div>
              <Label htmlFor="maritalStatus" className="block mb-1">
                Marital Status <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => setValue("maritalStatus", value)}>
                <SelectTrigger id="maritalStatus" className={errors.maritalStatus ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
              {errors.maritalStatus && <p className="text-red-500 text-sm mt-1">{errors.maritalStatus.message}</p>}
            </div>

            {maritalStatus === "married" ? (
              <>
                <div>
                  <Label htmlFor="familyMembers" className="block mb-1">
                    Number of Family Members <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="familyMembers"
                    {...register("familyMembers")}
                    className={errors.familyMembers ? "border-red-500" : ""}
                    placeholder="e.g. 4"
                  />
                  {errors.familyMembers && <p className="text-red-500 text-sm mt-1">{errors.familyMembers.message}</p>}
                </div>
                <div>
                  <Label htmlFor="ageGroup" className="block mb-1">
                    Age Group of Family Members
                  </Label>
                  <Input
                    id="ageGroup"
                    {...register("ageGroup")}
                    className={errors.ageGroup ? "border-red-500" : ""}
                    placeholder="e.g. Adults (35-40), Children (5-10)"
                  />
                  {errors.ageGroup && <p className="text-red-500 text-sm mt-1">{errors.ageGroup.message}</p>}
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="studentOrWorking" className="block mb-1">
                  Are you a student or working? <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue("studentOrWorking", value)}>
                  <SelectTrigger id="studentOrWorking" className={errors.studentOrWorking ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="working">Working</SelectItem>
                  </SelectContent>
                </Select>
                {errors.studentOrWorking && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentOrWorking.message}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="contactNumber" className="block mb-1">
                WhatsApp/Mobile number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactNumber"
                {...register("contactNumber")}
                className={errors.contactNumber ? "border-red-500" : ""}
                placeholder="e.g. 9876543210"
                maxLength={10}
              />
              {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber.message}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="videoTour"
                checked={form.watch("videoTour")}
                onCheckedChange={(checked) => setValue("videoTour", checked as boolean)}
              />
              <Label htmlFor="videoTour" className="cursor-pointer">
                Would you like to see a video tour?
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeToFee"
                checked={form.watch("agreeToFee")}
                onCheckedChange={(checked) => setValue("agreeToFee", checked as boolean)}
                className={errors.agreeToFee ? "border-red-500" : ""}
              />
              <Label htmlFor="agreeToFee" className="cursor-pointer">
                Are you agree to pay one month rent as our consultant fee <span className="text-red-500">*</span>
              </Label>
            </div>
            {errors.agreeToFee && <p className="text-red-500 text-sm">{errors.agreeToFee.message}</p>}

            <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-800">
              {loading ? "Processing..." : `Submit & Pay ₹${feeAmount}`}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

