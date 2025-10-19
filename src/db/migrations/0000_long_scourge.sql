CREATE TABLE "password_reset" (
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp,
	CONSTRAINT "password_reset_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "prenotazioni" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"service_id" integer NOT NULL,
	"data_pren" timestamp NOT NULL,
	"worker" integer,
	"nota" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE "recensioni" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_utente" integer NOT NULL,
	"voto" integer DEFAULT 3 NOT NULL,
	"recensione" text,
	"data_recensione" timestamp DEFAULT '2025-10-18 19:24:25.537'
);
--> statement-breakpoint
CREATE TABLE "saloonServices" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"durata" integer NOT NULL,
	"prezzo" numeric NOT NULL,
	"descrizione" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text,
	"user_id" integer,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"mail" text NOT NULL,
	"nome" text NOT NULL,
	"cognome" text NOT NULL,
	"password" text NOT NULL,
	"gender" text DEFAULT 'Female' NOT NULL,
	"data_creazione" timestamp DEFAULT now(),
	"isAdmin" boolean DEFAULT false,
	CONSTRAINT "users_mail_unique" UNIQUE("mail")
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prenotazioni" ADD CONSTRAINT "prenotazioni_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prenotazioni" ADD CONSTRAINT "prenotazioni_service_id_saloonServices_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."saloonServices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prenotazioni" ADD CONSTRAINT "prenotazioni_worker_workers_id_fk" FOREIGN KEY ("worker") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recensioni" ADD CONSTRAINT "recensioni_id_utente_users_id_fk" FOREIGN KEY ("id_utente") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;