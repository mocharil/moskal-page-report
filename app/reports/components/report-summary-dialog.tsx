import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Summary } from "../types"

interface ReportSummaryDialogProps {
  summary: Summary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportSummaryDialog({ summary, open, onOpenChange }: ReportSummaryDialogProps) {
  if (!summary) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Summary</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Scope and Sentiment */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{summary.summary.scope_and_sentiment.title}</h3>
            <ul className="list-disc pl-6 space-y-2">
              {summary.summary.scope_and_sentiment.points.map((point, idx) => (
                <li key={idx} className="text-gray-700">{point}</li>
              ))}
            </ul>
          </div>

          {/* Dominant Topics */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{summary.summary.dominant_topics.title}</h3>
            <div className="space-y-4">
              {summary.summary.dominant_topics.topics.map((topic, idx) => (
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
            <h3 className="text-lg font-semibold mb-2">{summary.summary.peak_periods.title}</h3>
            <ul className="list-disc pl-6 space-y-2">
              {summary.summary.peak_periods.points.map((point, idx) => (
                <li key={idx} className="text-gray-700">{point}</li>
              ))}
            </ul>
          </div>

          {/* Negative Sentiment */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{summary.summary.negative_sentiment.title}</h3>
            <div className="space-y-3">
              {summary.summary.negative_sentiment.mentions.map((mention, idx) => (
                <div key={idx} className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-600">{mention.source}</h4>
                  <p className="text-gray-700 mt-1">{mention.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Recommendations */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{summary.summary.key_recommendations.title}</h3>
            <ul className="list-disc pl-6 space-y-2">
              {summary.summary.key_recommendations.points.map((point, idx) => (
                <li key={idx} className="text-gray-700">{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
