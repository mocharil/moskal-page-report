export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  apiLogin: process.env.NEXT_PUBLIC_API_LOGIN,
  es: {
    host: process.env.NEXT_PUBLIC_ES_HOST,
    username: process.env.NEXT_PUBLIC_ES_USERNAME,
    password: process.env.NEXT_PUBLIC_ES_PASSWORD
  }
}
