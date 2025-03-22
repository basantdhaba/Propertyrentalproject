"use client"

import type React from "react"

import DashboardNav from "@/components/dashboard-nav"
import ProtectedRoute from "@/components/protected-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        {children}
      </div>
    </ProtectedRoute>
  )
}

