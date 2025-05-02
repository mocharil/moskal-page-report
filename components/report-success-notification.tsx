import { CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReportSuccessNotificationProps {
  email: string
  keywords: string[]
  message?: string
  onClose: () => void
}

export function ReportSuccessNotification({
  email,
  keywords,
  message,
  onClose
}: ReportSuccessNotificationProps) {
  return (
    <Alert
      className="fixed bottom-4 right-4 w-96 bg-[#0047AB] bg-opacity-5 border border-[#0047AB] border-opacity-20 text-[#0047AB] shadow-lg animate-in slide-in-from-right rounded-xl"
      onMouseEnter={(e) => {
        const target = e.currentTarget
        setTimeout(() => {
          if (target.matches(':hover')) {
            onClose()
          }
        }, 5000)
      }}
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-[#0047AB] mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-medium text-[#0047AB]">Report Generation Started</h3>
          <AlertDescription className="text-[#0047AB] text-opacity-80">
            {message || (
              <>
                Report for <span className="font-semibold">{keywords.join(", ")}</span> will be sent to{" "}
                <span className="font-semibold">{email}</span> when ready.
              </>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}
