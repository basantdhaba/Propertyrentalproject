"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  LayoutDashboard,
  Home,
  Users,
  ClipboardList,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  FileSpreadsheet,
} from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Properties", href: "/admin/properties", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Manage Admins", href: "/admin/manage-admins", icon: Shield },
    { name: "Reports", href: "/admin/reports", icon: FileSpreadsheet },
    { name: "Requests", href: "/admin/requests", icon: ClipboardList },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-40 flex h-16 w-full items-center justify-between bg-blue-800 px-4 md:hidden">
        <Link href="/admin" className="text-xl font-bold text-white">
          RentEase Admin
        </Link>
        <button onClick={toggleMobileMenu} className="rounded-md p-2 text-white hover:bg-blue-700">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" onClick={toggleMobileMenu}>
          <div
            className="fixed inset-y-0 left-0 z-40 w-64 transform bg-blue-800 p-4 transition duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-16 items-center justify-between">
              <Link href="/admin" className="text-xl font-bold text-white">
                RentEase Admin
              </Link>
              <button onClick={toggleMobileMenu} className="rounded-md p-2 text-white hover:bg-blue-700">
                <X size={24} />
              </button>
            </div>
            <nav className="mt-8">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                        pathname === item.href
                          ? "bg-blue-700 text-white"
                          : "text-blue-100 hover:bg-blue-700 hover:text-white"
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center rounded-md px-4 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden w-64 bg-blue-800 md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b border-blue-700">
            <Link href="/admin" className="text-xl font-bold text-white">
              RentEase Admin
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                      pathname === item.href
                        ? "bg-blue-700 text-white"
                        : "text-blue-100 hover:bg-blue-700 hover:text-white"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-blue-700 p-4">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center rounded-md px-4 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

