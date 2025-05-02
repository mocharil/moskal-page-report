"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { config } from "@/lib/config"
import { Loader2, Download, RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface Report {
  topic: string
  start_date: string
  end_date: string
  created_at: string
  status: string
  progress: number
  job_id?: string
  filename?: string
  url?: string
  keywords: string[]
}

interface ReportsResponse {
  status: string
  data: {
    total: number
    reports: Report[]
  }
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const reportsPerPage = 5

  useEffect(() => {
    // Try to get email from multiple sources
    const getEmail = () => {
      // First try localStorage (from report generation)
      const savedEmail = localStorage.getItem("reportEmail")
      if (savedEmail) return savedEmail

      // Then try user cookie (from login)
      const userCookie = Cookies.get("user")
      if (userCookie) {
        try {
          const userData = JSON.parse(userCookie)
          if (userData.email) return userData.email
        } catch (e) {
          console.error("Failed to parse user cookie:", e)
        }
      }
      
      return null
    }

    const userEmail = getEmail()
    if (userEmail) {
      setEmail(userEmail)
      fetchReports(userEmail)
    }
  }, [])

  // Auto-refresh when there are processing reports
  useEffect(() => {
    const hasProcessingReports = reports.some(report => report.status === "processing")
    
    if (hasProcessingReports && email) {
      const intervalId = setInterval(() => {
        fetchReports(email)
      }, 5000) // Poll every 5 seconds

      return () => clearInterval(intervalId)
    }
  }, [reports, email])

  const fetchReports = async (emailAddress: string) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/user-reports/${encodeURIComponent(emailAddress)}`)
      if (!response.ok) throw new Error("Failed to fetch reports")
      
      const data: ReportsResponse = await response.json()
      // Sort reports by created_at in descending order (newest first)
      const sortedReports = data.data.reports.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setReports(sortedReports)
    } catch (err) {
      setError("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const refreshReports = () => {
    if (email) {
      setLoading(true)
      fetchReports(email)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Filter reports based on search term (topic and keywords)
  const filteredReports = reports.filter(report =>
    report.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage)
  const startIndex = (currentPage - 1) * reportsPerPage
  const paginatedReports = filteredReports.slice(startIndex, startIndex + reportsPerPage)

  if (!email) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-gray-600">No reports found. Generate a report first.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <Card className="border-0 shadow-xl bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0047AB]">Your Reports</h1>
              <p className="text-sm text-gray-600 mt-1">Track the status of your report generation requests</p>
            </div>
            <Button
              onClick={refreshReports}
              variant="outline"
              className="flex items-center gap-2 border-[#0047AB] border-opacity-20 text-[#0047AB] hover:bg-[#0047AB] hover:bg-opacity-5"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search reports by topic or keywords..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset to first page when searching
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-red-600">{error}</p>
          </CardContent>
        </Card>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-gray-600">
              {searchTerm ? "No reports found matching your search" : "No reports found"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedReports.map((report, index) => (
              <Card key={`${report.job_id}-${index}`} className="overflow-hidden border border-[#0047AB] border-opacity-10 hover:border-opacity-20 transition-all duration-200">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 bg-[#0047AB] bg-opacity-5 w-32 h-32 rounded-full -mr-16 -mt-16 z-0" />
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <h3 className="text-lg font-semibold text-[#0047AB] capitalize">{report.topic}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(report.start_date), "MMM d, yyyy")} - {format(new Date(report.end_date), "MMM d, yyyy")}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Created: {format(new Date(report.created_at), "MMM d, yyyy HH:mm")}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {report.keywords.map((keyword, idx) => (
                          <Badge 
                            key={idx} 
                            className="bg-[#0047AB] bg-opacity-10 text-[#0047AB] hover:bg-opacity-20"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge className={`${getStatusBadgeColor(report.status)} capitalize`}>
                      {report.status === "processing" ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>{report.progress}%</span>
                        </div>
                      ) : (
                        report.status
                      )}
                    </Badge>
                  </div>
                  
                  {report.status === "completed" && report.url && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 border-[#0047AB] border-opacity-20 text-[#0047AB] hover:bg-[#0047AB] hover:bg-opacity-5"
                        onClick={() => window.open(report.url, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                        Download Report
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  )
}
