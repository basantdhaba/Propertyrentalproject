import type React from "react"
import { AuthProvider } from "@/contexts/auth-context"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import "@/styles/globals.css"
// Add the import for the Google Translate CSS
import "@/app/google-translate.css"

export const metadata = {
  title: "RentEase - Find Your Perfect Home",
  description: "RentEase is a property rental platform that helps you find your perfect home with ease.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </body>
      </html>
    </AuthProvider>
  )
}



import './globals.css'