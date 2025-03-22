"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import PropertyInterestForm from "./PropertyInterestForm"

type ExpressInterestButtonProps = {
  propertyId: string
  propertyName: string
}

export default function ExpressInterestButton({ propertyId, propertyName }: ExpressInterestButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button onClick={() => setShowModal(true)} className="w-full bg-black text-white hover:bg-gray-800">
        Express Interest
      </Button>

      {showModal && (
        <PropertyInterestForm propertyId={propertyId} propertyName={propertyName} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}

