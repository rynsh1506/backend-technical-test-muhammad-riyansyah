/**
 * Central application configuration.
 * All values are read from environment variables with safe fallbacks for local development.
 *
 * @see .env.example for the full list of required environment variables.
 */
export const APP_CONFIG = {
  /** HTTP port the server listens on. */
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,

  /** Base URL used for internal references (e.g., Eden Treaty in tests). */
  BASE_URL: process.env.BASE_URL || "http://localhost",

  JWT: {
    /** HMAC-SHA256 signing secret. Must be a strong random string in production. */
    SECRET: process.env.JWT_SECRET || "default_secret",
  },

  COOKIE: {
    NAME: "auth_token",
    HTTP_ONLY: true,
    /** Session lifetime in seconds. Default: 7 days (7 × 86 400). */
    MAX_AGE: 7 * 86400,
    PATH: "/",
    /**
     * "lax" — cookie is sent on same-site navigations but blocked on cross-site
     * sub-resource requests, providing baseline CSRF protection.
     */
    SAME_SITE: "lax" as const,
  },

  DB: {
    /**
     * Full PostgreSQL connection string assembled from individual env vars.
     * Format: postgres://<user>:<password>@<host>:<port>/<database>
     */
    URL:
      process.env.DATABASE_URL ||
      [
        `postgres://`,
        `${process.env.DB_USER ?? "postgres"}`,
        `:${process.env.DB_PASSWORD ?? "postgres"}`,
        `@${process.env.DB_HOST ?? "localhost"}`,
        `:${process.env.DB_PORT ?? "5432"}`,
        `/${process.env.DB_NAME ?? "inventory_db_test"}`,
      ].join(""),
  },
};
