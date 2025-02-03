

import { useState } from "react";
import { toast } from "react-hot-toast";

// Define Property Interface
interface Property {
  id: number;
  name: string;
  location: string;
  price: number;
  // Add any other property fields as needed
}

// PropertyGrid Component
const PropertyGrid = ({ properties }: { properties: Property[] }) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  // Handle Click Event to Fetch Property Details
  const handlePropertyClick = async (propertyId: number) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch property details");
      }
      const propertyData = await response.json();
      setSelectedProperty(propertyData);
      setIsEditFormOpen(true);
    } catch (error) {
      console.error("Error fetching property details:", error);
      toast.error("Failed to load property details.");
    }
  };

  return (
    <div>
      <div className="property-grid">
        {properties.map((property) => (
          <div
            key={property.id}
            className="property-card"
            onClick={() => handlePropertyClick(property.id)}
          >
            <h3>{property.name}</h3>
            <p>{property.location}</p>
            <p>${property.price}</p>
          </div>
        ))}
      </div>

      {isEditFormOpen && selectedProperty && (
        <div className="edit-form">
          <h2>Edit Property</h2>
          <p>Property Name: {selectedProperty.name}</p>
          {/* Add form fields and other components */}
          <button onClick={() => setIsEditFormOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default PropertyGrid;



