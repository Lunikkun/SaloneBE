CREATE TABLE IF NOT EXISTS "saloonServices" (
	"id" numeric PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"prezzo" numeric NOT NULL,
	"descrizione" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"mail" text NOT NULL,
	"nome" text NOT NULL,
	"cognome" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_mail_unique" UNIQUE("mail")
);
