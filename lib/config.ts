export const config = {
  appName: "HealthUPI",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  
  // Feature flags
  features: {
    videoCall: true,
    chat: true,
    homeVisit: false,
    emergency: true,
    subscription: false,
  },
  
  // Pagination
  defaultPageSize: 10,
  maxPageSize: 100,
  
  // Timeouts (in milliseconds)
  timeouts: {
    api: 30000,
    videoCall: 1800000, // 30 minutes
    otp: 60000, // 1 minute
  },
  
  // Validation
  validation: {
    minPasswordLength: 8,
    maxNameLength: 100,
    maxBioLength: 1000,
  },
}
