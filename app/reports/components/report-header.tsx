import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, Search } from "lucide-react"

interface ReportHeaderProps {
  onRefresh: () => void
  searchTerm: string
  onSearchChange: (value: string) => void
  loading: boolean
}

export function ReportHeader({ onRefresh, searchTerm, onSearchChange, loading }: ReportHeaderProps) {
  return (
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
            onClick={onRefresh}
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 w-full text-base border-2 border-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg 
              transition-all duration-300 hover:border-blue-200 cursor-text"
          />
        </div>
      </CardContent>
    </Card>
  )
}
