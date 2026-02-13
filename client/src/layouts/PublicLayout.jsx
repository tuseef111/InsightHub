import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Home as HomeIcon, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

export default function PublicLayout() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  const navigation = isAuthenticated ? [
    { name: 'Home', href: '/home', icon: HomeIcon },
    // { name: 'Profile', href: '/profile', icon: HomeIcon },
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Collections', href: '/collections', icon: HomeIcon },
    { name: 'Resources', href: '/resources', icon: HomeIcon },
  ] : [
    { name: 'Home', href: '/home', icon: HomeIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="fixed inset-y-0 z-50 flex w-64 flex-col bg-white shadow-lg dark:bg-gray-800">
        <div className="flex h-16 items-center justify-center border-b px-4">
          <h1 className="text-xl font-bold text-primary">InsightHub</h1>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    isActive
                      ? "bg-gray-100 text-primary dark:bg-gray-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                    "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500",
                      "mr-3 h-6 w-6 flex-shrink-0"
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="border-t p-4">
          {!isAuthenticated && (
            <div className="flex justify-center">
              <Link to="/login">
                <Button size="sm" variant="outline">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="pl-64">
        <TopBar />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function TopBar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return (
    <div className="sticky top-0 z-40 bg-background border-b">
      <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-end">
        {isAuthenticated && (
          <div className="relative">
            <button
              className="flex items-center gap-2"
              onClick={() => setOpen((o) => !o)}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm">
                  {(user?.name || "U").slice(0, 1).toUpperCase()}
                </div>
              )}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover shadow">
                <div className="p-2 border-b">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">{user?.email}</p>
                </div>
                <div className="py-1 text-sm">
                  {/* <Link
                    to="/profile"
                    className="block px-3 py-2 hover:bg-muted"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link> */}
                  <button
                    className="block w-full text-left px-3 py-2 hover:bg-muted"
                    onClick={() => {
                      logout()
                      navigate('/')
                      setOpen(false)
                      queryClient.clear()
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
