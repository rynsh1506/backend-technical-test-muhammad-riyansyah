CREATE TABLE "idempotency_keys" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"path" varchar(255) NOT NULL,
	"method" varchar(10) NOT NULL,
	"response" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
