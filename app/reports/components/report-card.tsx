import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, FileText, Loader2, RotateCw } from "lucide-react"
import { Report } from "../types"
import { getStatusBadgeColor } from "../utils"

interface ReportCardProps {
  report: Report
  onRegenerateReport: (jobId: string) => void
  onViewSummary: (summary: Report['summary']) => void
  regeneratingIds: string[]
}

export function ReportCard({ 
  report, 
  onRegenerateReport, 
  onViewSummary, 
  regeneratingIds 
}: ReportCardProps) {
  return (
    <Card className="overflow-hidden border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 
      transform hover:-translate-y-1 hover:shadow-lg rounded-xl">
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
              onClick={() => onViewSummary(report.summary)}
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
              onClick={() => onRegenerateReport(report.job_id!)}
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
  )
}
