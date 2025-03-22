"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, Filter, Eye, Edit, Trash2, UserPlus, Home, User, Shield } from "lucide-react"
import { db, collection, getDocs, query, where, deleteDocument } from "@/lib/firebase"

export default function AdminUsers() {
  const searchParams = useSearchParams()
  const roleFilter = searchParams.get("role")

  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState(roleFilter || "all")
  const [userProperties, setUserProperties] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        let q
        if (filterRole && filterRole !== "all") {
          q = query(collection(db, "users"), where("role", "==", filterRole))
        } else {
          q = collection(db, "users")
        }

        const querySnapshot = await getDocs(q)
        const usersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setUsers(usersData)

        // Fetch properties to determine if users are owners
        const propertiesSnapshot = await getDocs(collection(db, "properties"))
        const ownerMap: Record<string, boolean> = {}

        propertiesSnapshot.docs.forEach((doc) => {
          const property = doc.data()
          if (property.owner) {
            ownerMap[property.owner] = true
          }
        })

        setUserProperties(ownerMap)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [filterRole])

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteDocument("users", id)
        setUsers(users.filter((user) => user.id !== id))
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const filteredUsers = users.filter((user) => {
    const searchString = searchQuery.toLowerCase()
    return (
      user.name?.toLowerCase().includes(searchString) ||
      user.email?.toLowerCase().includes(searchString) ||
      user.phone?.toLowerCase().includes(searchString)
    )
  })

  const getRoleBadge = (role: string, hasProperties: boolean) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </span>
        )
      case "landlord":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            <Home className="mr-1 h-3 w-3" />
            Landlord
          </span>
        )
      case "owner":
      case hasProperties:
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <Home className="mr-1 h-3 w-3" />
            Owner
          </span>
        )
      case "tenant":
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            <User className="mr-1 h-3 w-3" />
            Tenant
          </span>
        )
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col justify-between sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <Link
          href="/admin/users/add"
          className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:mt-0"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <select
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="landlord">Landlords</option>
            <option value="tenant">Tenants</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-md">
          {filteredUsers.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200"></div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || "Unnamed User"}</div>
                          <div className="text-sm text-gray-500">ID: {user.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone || "No phone"}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getRoleBadge(user.role || "tenant", !!userProperties[user.id])}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at.seconds * 1000).toLocaleDateString() : "Unknown"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-gray-100 p-3">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search or filter to find what you're looking for."
                  : "Get started by adding a new user."}
              </p>
              <div className="mt-6">
                <Link
                  href="/admin/users/add"
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New User
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

