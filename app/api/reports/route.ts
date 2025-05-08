import { NextResponse } from "next/server";
import { Client } from '@elastic/elasticsearch';

// Use server-side environment variables
const ES_HOST = process.env.NEXT_PUBLIC_ES_HOST;
const ES_USERNAME = process.env.NEXT_PUBLIC_ES_USERNAME;
const ES_PASSWORD = process.env.NEXT_PUBLIC_ES_PASSWORD;

if (!ES_HOST || !ES_USERNAME || !ES_PASSWORD) {
  throw new Error('Missing required environment variables for Elasticsearch');
}

const client = new Client({
  node: ES_HOST,
  auth: {
    username: ES_USERNAME,
    password: ES_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // For development only, handle with caution in production
  }
});

// Test connection
client.ping()
  .then(() => console.log('Successfully connected to Elasticsearch'))
  .catch(e => console.error('Failed to connect to Elasticsearch:', e));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { index, query } = body;

    const esResponse = await client.search({
      index: index,
      body: {
        query: query.query,
        sort: query.sort
      }
    });

    // Return the raw response data structure that matches ESSearchResponse type
    return NextResponse.json({
      hits: {
        hits: esResponse.hits.hits
      }
    });
  } catch (error) {
    console.error('ES proxy error:', error);
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : '';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch from Elasticsearch',
        message: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
