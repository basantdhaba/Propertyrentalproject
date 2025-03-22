"use client"
import HeroSection from "@/components/HeroSection"
import FeaturedProperties from "@/components/FeaturedProperties"

export default function Home() {
  // const [properties, setProperties] = useState<any[]>([])
  // const [loading, setLoading] = useState(true)
  // const [error, setError] = useState("")

  // useEffect(() => {
  //   const fetchProperties = async () => {
  //     const { data, error } = await getDocumentsByField("properties", "status", "approved")
  //     if (error) {
  //       setError(error)
  //     } else {
  //       setProperties(data)
  //     }
  //     setLoading(false)
  //   }
  //   fetchProperties()
  // }, [])

  // if (loading) return <div>Loading...</div>
  // if (error) return <div>Error: {error}</div>

  return (
    <div>
      <HeroSection />
      <FeaturedProperties />
      {/* <h1 className="text-3xl font-bold mb-4">Available Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((property) => (
          <div key={property.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{property.name}</h2>
            <img
              src={property.imageUrl || "/placeholder.svg"}
              alt={property.name}
              className="w-full h-48 object-cover my-2 rounded"
            />
            <p>Type: {property.type}</p>
            <p>Price: ${property.price}/month</p>
            <p>Location: {property.location}</p>
            <Link href={`/property/${property.id}`} className="mt-2 inline-block bg-blue-500 text-white p-2 rounded">
              View Details
            </Link>
          </div>
        ))}
      </div> */}
    </div>
  )
}

