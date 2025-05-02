"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { config } from "../../lib/config"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Loader2 } from "lucide-react"
import Cookies from "js-cookie"

interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: {
    email: string
    id: number
    name: string
    is_active: boolean
    is_verified: boolean
    created_at: string
    updated_at: string
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new URLSearchParams()
      formData.append("grant_type", "")
      formData.append("username", email)
      formData.append("password", password)
      formData.append("scope", "")
      formData.append("client_id", "")
      formData.append("client_secret", "")

      if (!config.apiLogin) {
        throw new Error("Login API URL not configured")
      }

      const response = await fetch(config.apiLogin, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "accept": "application/json"
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error("Invalid credentials")
      }

      const data: LoginResponse = await response.json()
      
      // Store tokens in cookies
      Cookies.set("access_token", data.access_token, { expires: 7 }) // 7 days
      Cookies.set("refresh_token", data.refresh_token, { expires: 30 }) // 30 days
      Cookies.set("user", JSON.stringify(data.user), { expires: 7 })

      // Save email to localStorage for reports
      localStorage.setItem("reportEmail", data.user.email)

      // Redirect to home page
      router.push("/")
    } catch (err) {
      setError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex flex-col items-center">
            <Image
              src="/moskal-logo.png"
              alt="Moskal"
              width={80}
              height={80}
              className="mb-4"
            />
            <h2 className="text-3xl font-bold text-[#0047AB] mb-2">MOSKAL</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Welcome back</h3>
            <p className="text-sm text-gray-600 mb-8">
              Please enter your account details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email<span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email business email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password<span className="text-red-500">*</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#0047AB] hover:bg-[#0047AB]/90"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
