export const APP_CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,

  BASE_URL: process.env.BASE_URL || "http://localhost",

  JWT: {
    SECRET: process.env.JWT_SECRET || "default_secret",
  },

  COOKIE: {
    NAME: "auth_token",
    HTTP_ONLY: true,
    /** Duration in seconds. Default: 7 days. */
    MAX_AGE: 7 * 86400,
    PATH: "/",
    /** "lax" prevents the cookie from being sent on cross-site requests, mitigating CSRF attacks. */
    SAME_SITE: "lax" as const,
  },

  DB: {
    URL: `postgres://${process.env.DB_USER || "postgres"}:${process.env.DB_PASSWORD || "postgres"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "inventory_db_test"}`,
  },
};
