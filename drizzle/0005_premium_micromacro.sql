ALTER TABLE "users" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_mail_unique" UNIQUE("mail");