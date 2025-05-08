"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"
import Cookies from "js-cookie"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    // Clear all auth cookies
    Cookies.remove("access_token")
    Cookies.remove("refresh_token")
    Cookies.remove("user")
    // Clear localStorage
    localStorage.removeItem("reportEmail")
    // Redirect to login
    router.push("/login")
  }

  // Don't show navigation on login page
  if (pathname === "/login") {
    return null
  }

  return (
    <nav className="bg-[#0047AB] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/moskal-logo.png"
                  alt="Moskal"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
                <span className="text-xl font-bold text-white">MOSKAL</span>
              </Link>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium text-white border-b-2 ${
                  pathname === "/" ? "border-white" : "border-transparent hover:border-white/30"
                }`}
              >
                Generate Report
              </Link>
              <Link
                href="/reports"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium text-white border-b-2 ${
                  pathname === "/reports" ? "border-white" : "border-transparent hover:border-white/30"
                }`}
              >
                My Reports
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="outline"
              className="bg-white text-[#0047AB] hover:bg-[#0047AB] hover:text-white rounded-full px-6 border-2 border-white transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
