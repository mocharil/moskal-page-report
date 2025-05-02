"use client"

import type React from "react"
import { useState } from "react"
import { Loader2, Plus, X, Search, TrendingUp, AlertCircle, Mail, Calendar } from "lucide-react"
import { format, subDays } from "date-fns"
import { DateRange } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { ReportSuccessNotification } from "@/components/report-success-notification"
import { Notification } from "@/components/notification"
import { config } from "@/lib/config"

// Rest of the file remains unchanged
const fetchRelevantKeywords = async (keyword: string): Promise<string[]> => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/generate-sub-keywords?topic=${encodeURIComponent(keyword)}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch keywords');
    }

    const data = await response.json();
    return data.sub_keyword || [];
  } catch (error) {
    console.error('Error fetching keywords:', error);
    throw error;
  }
}

export default function KeywordAnalyzer() {
  const [mainKeyword, setMainKeyword] = useState("")
  const [relevantKeywords, setRelevantKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState("")
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("reportEmail") || ""
    }
    return ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [showErrorNotification, setShowErrorNotification] = useState(false)
  const [reportUrl, setReportUrl] = useState<string>("")
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    if (!mainKeyword) {
      setError("Please enter a main keyword")
      return
    }

    if (!date?.from || !date?.to) {
      setError("Please select a date range")
      return
    }

    if (!email) {
      setError("Please enter an email address to receive the report")
      return
    }

    setError("")
    setEmailError("")
    setIsGeneratingReport(true)

    try {
      const params = new URLSearchParams({
        topic: mainKeyword,
        start_date: format(date.from, 'yyyy-MM-dd'),
        end_date: format(date.to, 'yyyy-MM-dd'),
        sub_keyword: relevantKeywords.join(','),
        email_receiver: email
      });

      const response = await fetch(`${config.apiBaseUrl}/generate-report?${params}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        // Save email to localStorage for the reports page
        localStorage.setItem("reportEmail", email);
        setShowSuccessNotification(true);
      } else {
        throw new Error(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError("Failed to generate report. Please try again.");
      setShowErrorNotification(true);
    } finally {
      setIsGeneratingReport(false);
    }
  }

  return (
    <div className="content-wrapper max-w-4xl mx-auto px-4 py-12">
      <Card className="card overflow-hidden border-0 rounded-2xl fade-in">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-[#0047AB]">
                Generate Report
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Enter a topic to analyze public sentiment and discover related keywords across social media conversations.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Range Picker */}
              <div>
                <Label htmlFor="date-range" className="block text-sm font-semibold mb-2 text-gray-700">
                  Date Range
                </Label>
                <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-range"
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-white border-[#0047AB] border-opacity-20 hover:border-opacity-30 transition-all duration-200"
                      >
                        <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Main Keyword Input */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-white border border-[#0047AB] border-opacity-20 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0047AB] focus-within:ring-opacity-20">
                  <div className="pl-4 text-blue-500">
                    <Search className="h-5 w-5" />
                  </div>
                  <Input
                    id="mainKeyword"
                    value={mainKeyword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMainKeyword(e.target.value)}
                    placeholder="e.g., politics, economy, social issues"
                    className="border-0 h-14 focus:ring-0 rounded-none bg-transparent pl-2"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 bg-[#0047AB] hover:bg-[#003d91] rounded-xl transition-all duration-300 button-animate"
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
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50/50 backdrop-blur-sm rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{error}</AlertDescription>
        </Alert>
      )}

      {relevantKeywords.length > 0 && (
        <Card className="card border border-[#0047AB] border-opacity-10 rounded-2xl overflow-hidden mt-8 fade-in">
          <CardContent className="p-8">
            <div className="absolute top-0 right-0 bg-[#0047AB] bg-opacity-5 w-32 h-32 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 bg-[#0047AB] bg-opacity-5 w-24 h-24 rounded-full -ml-12 -mb-12" />
            <div className="space-y-8">
              <div>
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-[#0047AB] bg-opacity-10 rounded-lg mr-3">
                    <TrendingUp className="text-[#0047AB] h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0047AB]">Relevant Keywords</h3>
                  <Badge className="ml-3 bg-[#0047AB] bg-opacity-10 text-[#0047AB]">{relevantKeywords.length}</Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {relevantKeywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="py-2 px-4 text-sm flex items-center gap-2 bg-white border border-[#0047AB] border-opacity-20 text-gray-700 hover:bg-[#0047AB] hover:bg-opacity-5 transition-all duration-200 rounded-lg"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="sr-only">Remove {keyword}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t border-blue-100 pt-8">
                <label htmlFor="newKeyword" className="block text-sm font-semibold mb-3 text-gray-700">
                  Add Custom Keyword
                </label>
                <div className="flex gap-3">
                  <Input
                    id="newKeyword"
                    value={newKeyword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKeyword(e.target.value)}
                    placeholder="Enter a custom keyword"
                    className="flex-1 bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-200 rounded-xl h-12"
                  />
                  <Button
                    onClick={addKeyword}
                    variant="outline"
                    className="h-12 border border-[#0047AB] border-opacity-20 text-[#0047AB] hover:bg-[#0047AB] hover:bg-opacity-5 flex items-center gap-2 transition-all duration-200 rounded-xl button-animate"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="border-t border-blue-100 pt-8">
                <div className="mb-6">
                  <Label htmlFor="email" className="block text-sm font-semibold mb-3 text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      placeholder="Enter your email to receive the report"
                      className="pl-12 bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-200 rounded-xl h-12"
                    />
                  </div>
                  {emailError && <p className="text-red-500 text-sm mt-2">{emailError}</p>}
                  <p className="text-sm text-gray-500 mt-3">
                    We'll send the sentiment analysis report to this email address.
                  </p>
                </div>

                <Button
                  onClick={generateReport}
                  disabled={isGeneratingReport}
                  className="w-full h-14 bg-[#0047AB] hover:bg-[#003d91] rounded-xl text-lg font-semibold transition-all duration-300 button-animate"
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
          message="Your report generation has started. You can check the status in the Reports page."
          onClose={() => {
            setShowSuccessNotification(false);
            window.location.href = "/reports";
          }}
        />
      )}

      {/* Error Notification */}
      {showErrorNotification && (
        <Notification
          type="error"
          title="Analysis Failed"
          message="We couldn't analyze your keywords. Please try again."
          onClose={() => setShowErrorNotification(false)}
        />
      )}
    </div>
  )
}
