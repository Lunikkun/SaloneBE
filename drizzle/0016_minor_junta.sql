CREATE TABLE IF NOT EXISTS "saloonServices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"nome" text NOT NULL,
	"prezzo" numeric NOT NULL,
	"descrizione" text,
	CONSTRAINT "saloonServices_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"mail" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"cognome" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_mail_unique" UNIQUE("mail")
);
