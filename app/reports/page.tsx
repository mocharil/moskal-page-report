"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { config } from "@/lib/config"
import { Loader2, Download, RefreshCw, RotateCw, Search, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Notification } from "@/components/notification"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface Summary {
  summary: {
    scope_and_sentiment: {
      title: string;
      points: string[];
    };
    dominant_topics: {
      title: string;
      topics: Array<{
        name: string;
        reach: string;
        sentiment: string;
        key_points: string[];
      }>;
    };
    peak_periods: {
      title: string;
      points: string[];
    };
    negative_sentiment: {
      title: string;
      mentions: Array<{
        source: string;
        description: string;
      }>;
    };
    key_recommendations: {
      title: string;
      points: string[];
    };
  };
}

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
  summary?: Summary
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
  const [regeneratingIds, setRegeneratingIds] = useState<string[]>([])
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null)
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

  const regenerateReport = async (jobId: string) => {
    if (!jobId || !email) return
    
    setNotification(null)
    setRegeneratingIds(prev => [...prev, jobId])
    
    try {
      console.log('Starting report regeneration for job:', jobId)
      
      const params = new URLSearchParams({
        job_id: jobId,
        email: email
      });
      
      const response = await fetch(`${config.apiBaseUrl}/regenerate-report?${params}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json'
        }
      })

      console.log('Regenerate API response status:', response.status)
      const data = await response.json()
      console.log('Regenerate API response data:', data)

      if (!response.ok) {
        throw new Error(`Failed to regenerate report: ${response.status} - ${data.message || 'Unknown error'}`)
      }

      // Validate response data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid API response format')
      }
      
      setNotification({
        type: 'success',
        title: 'Report Regeneration Started',
        message: 'Your report is being regenerated. You will be notified when it is ready.'
      })
      
      // Refresh reports list after regeneration
      console.log('Refreshing reports list...')
      await fetchReports(email)
    } catch (err) {
      console.error('Report regeneration failed:', err)
      setNotification({
        type: 'error',
        title: 'Regeneration Failed',
        message: err instanceof Error ? err.message : 'Failed to regenerate report'
      })
    } finally {
      setRegeneratingIds(prev => prev.filter(id => id !== jobId))
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Filter reports based on search term (topic and keywords)
  const filteredReports = reports.filter(report => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    
    // Search in topic
    if (report.topic.toLowerCase().includes(search)) return true;
    
    // Search in keywords
    return report.keywords.some(keyword => 
      keyword.toLowerCase().includes(search)
    );
  })

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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden transform transition-all duration-300 hover:shadow-xl">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Your Reports
              </h1>
              <p className="text-sm text-gray-600 mt-2">Track the status of your report generation requests</p>
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

          {/* Modern Search input */}
          <div className="relative group z-10">
            <div className="pointer-events-none absolute inset-0 bg-blue-100 opacity-0 group-hover:opacity-10 rounded-lg transition-all duration-300"></div>
            <Search className="pointer-events-none absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
            <Input
              type="text"
              placeholder="Search reports by topic or keywords..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-12 h-12 w-full text-base border-2 border-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg 
                transition-all duration-300 hover:border-blue-200 cursor-text"
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
              <Card 
                key={`${report.job_id}-${index}`} 
                className="overflow-hidden border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 
                  transform hover:-translate-y-1 hover:shadow-lg rounded-xl"
              >
                <CardContent className="p-8 relative">
                  <div className="absolute top-0 right-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 
                    w-48 h-48 rounded-full -mr-24 -mt-24 z-0 transition-all duration-500 group-hover:scale-110" />
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
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-300
                              px-3 py-1 rounded-full text-sm"
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
                  
                  <div className="mt-4 flex gap-2">
                    {report.status === "completed" && report.url && (
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 border-2 border-blue-100 text-blue-600 
                          hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 rounded-lg px-6"
                        onClick={() => window.open(report.url, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                        Download Report
                      </Button>
                    )}
                    {report.status === "completed" && report.summary && (
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 border-2 border-blue-100 text-blue-600 
                          hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 rounded-lg px-6"
                        onClick={() => report.summary && setSelectedSummary(report.summary)}
                      >
                        <FileText className="h-4 w-4" />
                        View Summary
                      </Button>
                    )}
                    {report.status === "failed" && report.job_id && (
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 border-2 border-red-100 text-red-600 
                          hover:bg-red-50 hover:border-red-200 transition-all duration-300 rounded-lg px-6"
                        onClick={() => regenerateReport(report.job_id!)}
                        disabled={regeneratingIds.includes(report.job_id)}
                      >
                        {regeneratingIds.includes(report.job_id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCw className="h-4 w-4" />
                        )}
                        Regenerate Report
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary Dialog */}
          <Dialog open={!!selectedSummary} onOpenChange={() => setSelectedSummary(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Report Summary</DialogTitle>
              </DialogHeader>
              {selectedSummary && (
                <div className="space-y-6 py-4">
                  {/* Scope and Sentiment */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{selectedSummary.summary.scope_and_sentiment.title}</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      {selectedSummary.summary.scope_and_sentiment.points.map((point, idx) => (
                        <li key={idx} className="text-gray-700">{point}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Dominant Topics */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{selectedSummary.summary.dominant_topics.title}</h3>
                    <div className="space-y-4">
                      {selectedSummary.summary.dominant_topics.topics.map((topic, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-600">{topic.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">Reach: {topic.reach}</p>
                          <p className="text-sm text-gray-600">Sentiment: {topic.sentiment}</p>
                          <ul className="list-disc pl-6 mt-2">
                            {topic.key_points.map((point, pidx) => (
                              <li key={pidx} className="text-gray-700">{point}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Peak Periods */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{selectedSummary.summary.peak_periods.title}</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      {selectedSummary.summary.peak_periods.points.map((point, idx) => (
                        <li key={idx} className="text-gray-700">{point}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Negative Sentiment */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{selectedSummary.summary.negative_sentiment.title}</h3>
                    <div className="space-y-3">
                      {selectedSummary.summary.negative_sentiment.mentions.map((mention, idx) => (
                        <div key={idx} className="bg-red-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-red-600">{mention.source}</h4>
                          <p className="text-gray-700 mt-1">{mention.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Recommendations */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{selectedSummary.summary.key_recommendations.title}</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      {selectedSummary.summary.key_recommendations.points.map((point, idx) => (
                        <li key={idx} className="text-gray-700">{point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

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

          {/* Notification */}
          {notification && (
            <Notification
              type={notification.type}
              title={notification.title}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}
        </>
      )}
    </div>
  )
}
