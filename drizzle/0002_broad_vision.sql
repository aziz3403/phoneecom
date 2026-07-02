CREATE TABLE "bulkQuote" (
	"id" text PRIMARY KEY NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"company" text,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"batchSize" text NOT NULL,
	"notes" text,
	"status" text DEFAULT 'New' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tradeIn" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"email" text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"phone" text NOT NULL,
	"payoutMethod" text NOT NULL,
	"total" integer NOT NULL,
	"deviceCount" integer NOT NULL,
	"status" text DEFAULT 'Submitted' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wholesaleApplication" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"company" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"volume" text,
	"businessType" text,
	"region" text,
	"message" text,
	"status" text DEFAULT 'Pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"decidedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "isAdmin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tradeIn" ADD CONSTRAINT "tradeIn_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wholesaleApplication" ADD CONSTRAINT "wholesaleApplication_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;