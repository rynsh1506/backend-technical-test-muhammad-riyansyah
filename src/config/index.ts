export const APP_CONFIG = {
  // Server Config
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  
  // Application Base URL for Testing / Internal Requests
  BASE_URL: process.env.BASE_URL || "http://localhost",

  // JWT Security
  JWT: {
    SECRET: process.env.JWT_SECRET || "default_secret",
  },

  // Cookie Security Profile
  COOKIE: {
    NAME: "auth_token",
    HTTP_ONLY: true,
    MAX_AGE: 7 * 86400, // 7 days in seconds
    PATH: "/",
    SAME_SITE: "lax" as const, // Protects against CSRF
  },
};
