"use client";

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
  const [loading, setLoading] = useState(false);

  // Handle Click Event to Fetch Property Details
  const handlePropertyClick = async (propertyId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch property details");
      }
      const propertyData: Property = await response.json();
      setSelectedProperty(propertyData);
      setIsEditFormOpen(true);
    } catch (error) {
      console.error("Error fetching property details:", error);
      toast.error("Failed to load property details.");
    } finally {
      setLoading(false);
    }
  };

  // Close Edit Form
  const closeEditForm = () => {
    setSelectedProperty(null);
    setIsEditFormOpen(false);
  };

  return (
    <div className="property-grid-container">
      {/* Render Property Cards */}
      <div className="property-grid">
        {properties.length > 0 ? (
          properties.map((property) => (
            <div
              key={property.id}
              className="property-card"
              onClick={() => handlePropertyClick(property.id)}
            >
              <h3 className="property-name">{property.name}</h3>
              <p className="property-location">{property.location}</p>
              <p className="property-price">${property.price}</p>
            </div>
          ))
        ) : (
          <p className="no-properties-message">No properties available.</p>
        )}
      </div>

      {/* Render Edit Form */}
      {isEditFormOpen && selectedProperty && (
        <div className="edit-form">
          <h2>Edit Property</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <p>
                <strong>Property Name:</strong> {selectedProperty.name}
              </p>
              <p>
                <strong>Location:</strong> {selectedProperty.location}
              </p>
              <p>
                <strong>Price:</strong> ${selectedProperty.price}
              </p>
              {/* Add form fields and editing functionality here */}
              <button onClick={closeEditForm} className="close-btn">
                Close
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyGrid;
    
