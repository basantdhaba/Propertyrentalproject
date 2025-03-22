"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <section className="bg-gradient-to-r from-blue-600 to-teal-400 py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <h1 className="mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
          Find Your Perfect Home with RentEase
        </h1>
        <p className="mb-6 md:mb-8 text-base md:text-xl text-white">
          Discover thousands of rental properties in your area
        </p>
        <form onSubmit={handleSearch} className="mx-auto flex max-w-md md:max-w-2xl">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter city, neighborhood, or address"
              className="w-full rounded-l-md border-0 pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="rounded-r-md bg-rose-500 px-4 sm:px-8 py-3 text-white hover:bg-rose-600">
            Search
          </button>
        </form>
      </div>
    </section>
  )
}

