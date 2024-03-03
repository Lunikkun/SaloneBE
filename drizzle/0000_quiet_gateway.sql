CREATE TABLE IF NOT EXISTS "saloonServices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"prezzo" numeric NOT NULL,
	"descrizione" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"cognome" text NOT NULL,
	"mail" text NOT NULL
);
