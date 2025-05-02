import { CheckCircle2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"

interface NotificationProps {
  type: 'success' | 'error'
  title: string
  message: string
  onClose: () => void
}

export function Notification({
  type,
  title,
  message,
  onClose
}: NotificationProps) {
  const isSuccess = type === 'success'
  
  return (
    <Alert
      className={`fixed bottom-4 right-4 w-96 ${
        isSuccess 
          ? 'bg-[#0047AB] bg-opacity-5 border-[#0047AB] text-[#0047AB]' 
          : 'bg-red-500 bg-opacity-5 border-red-500 text-red-500'
      } border border-opacity-20 shadow-lg animate-in slide-in-from-right rounded-xl`}
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
        {isSuccess ? (
          <CheckCircle2 className={`h-5 w-5 ${isSuccess ? 'text-[#0047AB]' : 'text-red-500'} mt-0.5`} />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
        )}
        <div className="space-y-1">
          <h3 className="font-medium">{title}</h3>
          <AlertDescription className="text-opacity-80">
            {message}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}
