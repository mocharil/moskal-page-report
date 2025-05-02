"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, Mail, FileText, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReportSuccessNotificationProps {
  email?: string
  keywords: string[]
  reportUrl?: string
  onClose: () => void
  duration?: number
}

export function ReportSuccessNotification({
  email,
  keywords,
  reportUrl,
  onClose,
  duration = 8000,
}: ReportSuccessNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / (duration / 1000)
        return newProgress < 0 ? 0 : newProgress
      })
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 500)
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-blue-100 overflow-hidden transition-all duration-500 transform",
        isExiting ? "opacity-0 translate-y-10" : "opacity-100 translate-y-0",
      )}
    >
      {/* Progress bar */}
      <div className="h-1 bg-gray-100 w-full">
        <div
          className="h-full bg-[#0047AB] transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0047AB] to-[#0055cc] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">Report Generated!</h3>
            <p className="text-blue-100 text-xs">Sentiment analysis complete</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="rounded-full p-1 hover:bg-white/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {email && (
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-50 rounded-full p-2 flex-shrink-0">
              <Mail className="h-5 w-5 text-[#0047AB]" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Report sent to <span className="font-medium text-gray-800">{email}</span>
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-50 rounded-full p-2 flex-shrink-0">
            <FileText className="h-5 w-5 text-[#0047AB]" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              Analysis of{" "}
              <span className="font-medium text-gray-800">
                {keywords.length > 2
                  ? `${keywords[0]}, ${keywords[1]} & ${keywords.length - 2} more`
                  : keywords.join(", ")}
              </span>
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-700">Report Preview</h4>
            <div className="bg-blue-100 text-[#0047AB] text-xs px-2 py-0.5 rounded-full">PDF</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
              <img src="/moskal-logo.png" alt="Moskal Logo" className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded w-full mb-1.5"></div>
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>

        {/* Action button */}
        {reportUrl && (
          <a 
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 transition-colors rounded-md text-sm font-medium text-gray-700 flex items-center justify-center gap-1"
          >
            View Report
            <ChevronRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  )
}
