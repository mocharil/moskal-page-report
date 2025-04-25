"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, Plus, X, Search, TrendingUp, AlertCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { ReportSuccessNotification } from "@/components/report-success-notification"
import { NotificationError } from "@/components/notification"

// Mock function to simulate API call for relevant keywords
const fetchRelevantKeywords = async (keyword: string): Promise<string[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Mock relevant keywords based on input
  const mockKeywords: Record<string, string[]> = {
    "social media": ["instagram", "facebook", "twitter", "tiktok", "linkedin", "engagement", "followers"],
    "digital marketing": ["seo", "content marketing", "email marketing", "ppc", "social media marketing"],
    ecommerce: ["online store", "shopify", "woocommerce", "product listings", "payment gateway"],
    seo: ["backlinks", "keywords", "google ranking", "meta tags", "search engine"],
    content: ["blog posts", "articles", "videos", "infographics", "podcasts"],
    indonesia: ["jakarta", "bali", "surabaya", "bandung", "yogyakarta", "public opinion", "local news"],
    politics: ["election", "policy", "government", "campaign", "public sentiment", "approval rating"],
    economy: ["inflation", "market trends", "financial news", "economic policy", "business sentiment"],
  }

  // Return mock keywords or generate some if not in our mock data
  return (
    mockKeywords[keyword.toLowerCase()] || [
      `${keyword} trends`,
      `${keyword} sentiment`,
      `${keyword} analysis`,
      `${keyword} public opinion`,
      `${keyword} social impact`,
    ]
  )
}

export default function KeywordAnalyzer() {
  const [mainKeyword, setMainKeyword] = useState("")
  const [relevantKeywords, setRelevantKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [showErrorNotification, setShowErrorNotification] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mainKeyword.trim()) {
      setError("Please enter a main keyword")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const keywords = await fetchRelevantKeywords(mainKeyword)
      setRelevantKeywords(keywords)
    } catch (err) {
      setError("Failed to fetch relevant keywords. Please try again.")
      setShowErrorNotification(true)
    } finally {
      setIsLoading(false)
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    setRelevantKeywords(relevantKeywords.filter((keyword) => keyword !== keywordToRemove))
  }

  const addKeyword = () => {
    if (!newKeyword.trim()) return

    if (relevantKeywords.includes(newKeyword.trim())) {
      setError("This keyword already exists in the list")
      return
    }

    setRelevantKeywords([...relevantKeywords, newKeyword.trim()])
    setNewKeyword("")
    setError("")
  }

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const generateReport = async () => {
    if (relevantKeywords.length === 0) {
      setError("Please add at least one keyword before generating a report")
      return
    }

    if (!email) {
      setEmailError("Please enter your email to receive the report")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    setError("")
    setEmailError("")
    setIsGeneratingReport(true)

    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setIsGeneratingReport(false)
    setShowSuccessNotification(true)
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-blue-100 shadow-lg">
        <CardContent className="p-0">
          <div className="p-6 bg-gradient-to-r from-[#0047AB]/5 to-blue-50">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Main Keyword</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter a topic to analyze public sentiment and discover related keywords
            </p>

            <form onSubmit={handleSubmit} className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <Input
                id="mainKeyword"
                value={mainKeyword}
                onChange={(e) => setMainKeyword(e.target.value)}
                placeholder="e.g., politics, economy, social issues"
                className="pl-10 h-12 border-blue-100 focus:border-[#0047AB] focus:ring-[#0047AB]/20"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="absolute right-0 top-0 h-12 bg-[#0047AB] hover:bg-[#003d91] rounded-l-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{error}</AlertDescription>
        </Alert>
      )}

      {relevantKeywords.length > 0 && (
        <Card className="border-blue-100 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center mb-4">
                  <TrendingUp className="text-[#0047AB] h-5 w-5 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Relevant Keywords</h3>
                  <Badge className="ml-2 bg-blue-100 text-[#0047AB] hover:bg-blue-200">{relevantKeywords.length}</Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {relevantKeywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="py-1.5 px-3 text-sm flex items-center gap-1 bg-white border border-blue-100 text-gray-700 hover:bg-blue-50"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {keyword}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t border-blue-100 pt-6">
                <label htmlFor="newKeyword" className="block text-sm font-medium mb-2 text-gray-700">
                  Add Custom Keyword
                </label>
                <div className="flex gap-2">
                  <Input
                    id="newKeyword"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Enter a custom keyword"
                    className="flex-1 border-blue-100 focus:border-[#0047AB] focus:ring-[#0047AB]/20"
                  />
                  <Button
                    onClick={addKeyword}
                    variant="outline"
                    className="border-blue-200 text-[#0047AB] hover:bg-blue-50 hover:text-[#003d91] flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="border-t border-blue-100 pt-6">
                <div className="mb-4">
                  <Label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email to receive the report"
                      className="pl-10 border-blue-100 focus:border-[#0047AB] focus:ring-[#0047AB]/20"
                    />
                  </div>
                  {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                  <p className="text-xs text-gray-500 mt-2">
                    We'll send the sentiment analysis report to this email address.
                  </p>
                </div>

                <Button
                  onClick={generateReport}
                  disabled={isGeneratingReport}
                  className="w-full h-12 bg-[#0047AB] hover:bg-[#003d91] mt-4 text-white font-medium"
                >
                  {isGeneratingReport ? (
                    <>
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generating Sentiment Analysis Report...
                      </div>
                    </>
                  ) : (
                    "Generate & Send Sentiment Analysis Report"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Notification */}
      {showSuccessNotification && (
        <ReportSuccessNotification
          email={email}
          keywords={relevantKeywords}
          onClose={() => setShowSuccessNotification(false)}
        />
      )}

      {/* Error Notification */}
      {showErrorNotification && (
        <NotificationError
          title="Analysis Failed"
          message="We couldn't analyze your keywords. Please try again."
          onClose={() => setShowErrorNotification(false)}
        />
      )}
    </div>
  )
}
