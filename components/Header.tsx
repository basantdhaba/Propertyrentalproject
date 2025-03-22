"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Home, Menu, Plus, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import GoogleTranslate from "./GoogleTranslate"

export default function Header() {
  const { user, isAdmin, signOut } = useAuth()
  const router = useRouter()

  const handlePropertyClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      router.push("/login?redirect=/properties")
    }
  }

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center text-2xl font-bold text-blue-600">
          <Home className="mr-2 h-6 w-6" />
          <span className="hidden sm:inline">RentEase</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/properties" className="text-gray-600 hover:text-gray-900" onClick={handlePropertyClick}>
            <span className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              Properties
            </span>
          </Link>

          {user ? (
            <>
              {isAdmin ? (
                <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                  Admin Panel
                </Link>
              ) : (
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              )}
              <Link href="/list-property" className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
                <Plus className="h-4 w-4" />
                List Property
              </Link>
              <Button variant="ghost" onClick={() => signOut()} className="text-gray-600 hover:text-gray-900">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/list-property" className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
                <Plus className="h-4 w-4" />
                List Property
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/register" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Sign Up
              </Link>
            </>
          )}

          {/* Replace LanguageSelector with GoogleTranslate */}
          <GoogleTranslate />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          {/* Replace LanguageSelector with GoogleTranslate */}
          <GoogleTranslate />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between py-4 border-b">
                  <Link href="/" className="flex items-center text-xl font-bold text-blue-600">
                    <Home className="mr-2 h-5 w-5" />
                    RentEase
                  </Link>
                </div>
                <nav className="flex flex-col gap-4 py-6">
                  <SheetClose asChild>
                    <Link
                      href="/properties"
                      className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={handlePropertyClick}
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Properties
                    </Link>
                  </SheetClose>

                  {user ? (
                    <>
                      {isAdmin ? (
                        <SheetClose asChild>
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                          >
                            Admin Panel
                          </Link>
                        </SheetClose>
                      ) : (
                        <SheetClose asChild>
                          <Link
                            href="/dashboard"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                          >
                            Dashboard
                          </Link>
                        </SheetClose>
                      )}
                      <SheetClose asChild>
                        <Link
                          href="/list-property"
                          className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          <Plus className="h-4 w-4" />
                          List Property
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          onClick={() => signOut()}
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md justify-start font-normal"
                        >
                          Logout
                        </Button>
                      </SheetClose>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/list-property"
                          className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          <Plus className="h-4 w-4" />
                          List Property
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/login"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          Login
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/register"
                          className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                        >
                          Sign Up
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

