CREATE TABLE "userProfile" (
	"userId" text PRIMARY KEY NOT NULL,
	"fullName" text,
	"phone" text,
	"line1" text,
	"city" text,
	"state" text,
	"zip" text,
	"country" text DEFAULT 'United States',
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "userProfile" ADD CONSTRAINT "userProfile_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;