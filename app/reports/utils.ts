import { config } from "../../lib/config";
import { ESSearchResponse, Report, ESSource } from "./types";
import Cookies from "js-cookie";

export const getStatusBadgeColor = (status: string) => {
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

export const getUserEmail = () => {
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

const processCompletedReports = (data: ESSearchResponse): Report[] => {
  return data.hits.hits.map(hit => {
    const source = hit._source
    if (!source) return null

    return {
      topic: source.topic,
      start_date: source.start_date,
      end_date: source.end_date,
      filename: source.filename,
      url: source.public_url,
      created_at: source.created_at,
      status: "completed",
      progress: 100,
      keywords: source.keywords || [],
      summary: source.summary
    } as Report
  }).filter((report): report is Report => report !== null)
}

const processInProgressReports = (data: ESSearchResponse): Report[] => {
  return data.hits.hits.map(hit => {
    const source = hit._source
    if (!source) return null

    return {
      topic: source.topic,
      start_date: source.start_date,
      end_date: source.end_date,
      created_at: source.created_at,
      status: source.status || "processing",
      progress: source.progress || 0,
      job_id: source.id,
      keywords: source.sub_keyword ? source.sub_keyword.split(',') : [],
      summary: source.summary
    } as Report
  }).filter((report): report is Report => report !== null)
}

export const fetchReports = async (emailAddress: string): Promise<Report[]> => {
  // Search for completed reports
  const completedResult = await fetch('/api/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      index: 'moskal-reports',
      query: {
        query: {
          match: {
            email_receiver: emailAddress
          }
        },
        sort: [
          {
            "created_at.keyword": {
              order: "desc"
            }
          }
        ]
      }
    })
  })

  // Search for in-progress reports
  const inProgressResult = await fetch('/api/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      index: 'moskal-report-jobs',
      query: {
        query: {
          bool: {
            must: [
              { match: { email_receiver: emailAddress } },
              {
                bool: {
                  must_not: [
                    { match: { status: "completed" } }
                  ]
                }
              }
            ]
          }
        },
        sort: [
          {
            "created_at.keyword": {
              order: "desc"
            }
          }
        ]
      }
    })
  })

  if (!completedResult.ok || !inProgressResult.ok) {
    let errorMessage = 'Failed to fetch reports';
    
    try {
      if (!completedResult.ok) {
        const error = await completedResult.json();
        console.error('Completed reports error:', error);
        errorMessage = error.message || error.error || errorMessage;
      }
      if (!inProgressResult.ok) {
        const error = await inProgressResult.json();
        console.error('In-progress reports error:', error);
        errorMessage = error.message || error.error || errorMessage;
      }
    } catch (e) {
      console.error('Error parsing error response:', e);
    }
    
    throw new Error(errorMessage);
  }

  const completedData = await completedResult.json();
  const inProgressData = await inProgressResult.json();

  // Validate response structure
  if (!completedData?.hits?.hits || !inProgressData?.hits?.hits) {
    console.error('Invalid response structure:', { completedData, inProgressData });
    throw new Error('Invalid response from server');
  }

  const completedReports = processCompletedReports(completedData)
  const inProgressReports = processInProgressReports(inProgressData)

  // Combine and sort reports
  const allReports = [...inProgressReports, ...completedReports]
  return allReports.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export const regenerateReport = async (jobId: string, email: string) => {
  if (!jobId || !email) {
    throw new Error('Job ID and email are required')
  }

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

  if (!response.ok) {
    const data = await response.json()
    throw new Error(`Failed to regenerate report: ${response.status} - ${data.message || 'Unknown error'}`)
  }

  return response.json()
}
