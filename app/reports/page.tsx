"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Notification } from "@/components/notification"
import { Report, NotificationType, Summary } from "./types"
import { fetchReports, getUserEmail, regenerateReport } from "./utils"
import { ReportHeader } from "./components/report-header"
import { ReportCard } from "./components/report-card"
import { ReportSummaryDialog } from "./components/report-summary-dialog"
import { ReportPagination } from "./components/report-pagination"

const REPORTS_PER_PAGE = 5

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [regeneratingIds, setRegeneratingIds] = useState<string[]>([])
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null)
  const [notification, setNotification] = useState<NotificationType | null>(null)

  useEffect(() => {
    const userEmail = getUserEmail()
    if (userEmail) {
      setEmail(userEmail)
      loadReports(userEmail)
    }
  }, [])

  // Auto-refresh when there are processing reports
  useEffect(() => {
    const hasProcessingReports = reports.some(report => report.status === "processing")
    
    if (hasProcessingReports && email) {
      const intervalId = setInterval(() => {
        loadReports(email)
      }, 5000) // Poll every 5 seconds

      return () => clearInterval(intervalId)
    }
  }, [reports, email])

  const loadReports = async (emailAddress: string) => {
    try {
      const data = await fetchReports(emailAddress)
      setReports(data)
      setError("")
    } catch (err) {
      console.error('Error loading reports:', err)
      setError("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateReport = async (jobId: string) => {
    if (!jobId || !email) return
    
    setNotification(null)
    setRegeneratingIds(prev => [...prev, jobId])
    
    try {
      await regenerateReport(jobId, email)
      
      setNotification({
        type: 'success',
        title: 'Report Regeneration Started',
        message: 'Your report is being regenerated. You will be notified when it is ready.'
      })
      
      await loadReports(email)
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
  const totalPages = Math.ceil(filteredReports.length / REPORTS_PER_PAGE)
  const startIndex = (currentPage - 1) * REPORTS_PER_PAGE
  const paginatedReports = filteredReports.slice(startIndex, startIndex + REPORTS_PER_PAGE)

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
      <ReportHeader 
        onRefresh={() => loadReports(email)}
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value)
          setCurrentPage(1)
        }}
        loading={loading}
      />

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
              <ReportCard
                key={`${report.job_id}-${index}`}
                report={report}
                onRegenerateReport={handleRegenerateReport}
                onViewSummary={(summary) => summary && setSelectedSummary(summary)}
                regeneratingIds={regeneratingIds}
              />
            ))}
          </div>

          <ReportSummaryDialog
            summary={selectedSummary}
            open={!!selectedSummary}
            onOpenChange={(open) => !open && setSelectedSummary(null)}
          />

          <ReportPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

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
