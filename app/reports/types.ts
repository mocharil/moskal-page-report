export interface Summary {
  summary: {
    scope_and_sentiment: {
      title: string;
      points: string[];
    };
    dominant_topics: {
      title: string;
      topics: Array<{
        name: string;
        reach: string;
        sentiment: string;
        key_points: string[];
      }>;
    };
    peak_periods: {
      title: string;
      points: string[];
    };
    negative_sentiment: {
      title: string;
      mentions: Array<{
        source: string;
        description: string;
      }>;
    };
    key_recommendations: {
      title: string;
      points: string[];
    };
  };
}

export interface Report {
  topic: string;
  start_date: string;
  end_date: string;
  created_at: string;
  status: string;
  progress: number;
  job_id?: string;
  filename?: string;
  url?: string;
  keywords: string[];
  summary?: Summary;
}

export interface ESSource {
  topic: string;
  start_date: string;
  end_date: string;
  filename?: string;
  public_url?: string;
  created_at: string;
  status?: string;
  progress?: number;
  id?: string;
  keywords?: string[];
  sub_keyword?: string;
  summary?: Summary;
}

export interface ESSearchResponse {
  hits: {
    hits: Array<{
      _source: ESSource;
    }>;
  };
}

export interface NotificationType {
  type: 'success' | 'error';
  title: string;
  message: string;
}
