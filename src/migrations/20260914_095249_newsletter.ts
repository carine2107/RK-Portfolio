import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_subscribers_locale" AS ENUM('fr', 'de', 'en');
  CREATE TYPE "public"."enum_subscribers_status" AS ENUM('pending', 'confirmed', 'unsubscribed');
  CREATE TABLE "subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"locale" "enum_subscribers_locale" DEFAULT 'en' NOT NULL,
  	"status" "enum_subscribers_status" DEFAULT 'pending' NOT NULL,
  	"consent_at" timestamp(3) with time zone,
  	"confirmed_at" timestamp(3) with time zone,
  	"unsubscribed_at" timestamp(3) with time zone,
  	"source" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "insights" ADD COLUMN "send_newsletter" boolean DEFAULT false;
  ALTER TABLE "insights" ADD COLUMN "newsletter_sent_at" timestamp(3) with time zone;
  ALTER TABLE "insights" ADD COLUMN "newsletter_recipients" numeric;
  ALTER TABLE "_insights_v" ADD COLUMN "version_send_newsletter" boolean DEFAULT false;
  ALTER TABLE "_insights_v" ADD COLUMN "version_newsletter_sent_at" timestamp(3) with time zone;
  ALTER TABLE "_insights_v" ADD COLUMN "version_newsletter_recipients" numeric;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "subscribers_id" integer;
  CREATE UNIQUE INDEX "subscribers_email_idx" ON "subscribers" USING btree ("email");
  CREATE INDEX "subscribers_updated_at_idx" ON "subscribers" USING btree ("updated_at");
  CREATE INDEX "subscribers_created_at_idx" ON "subscribers" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscribers_fk" FOREIGN KEY ("subscribers_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("subscribers_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "subscribers" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "subscribers" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_subscribers_fk";
  
  DROP INDEX "payload_locked_documents_rels_subscribers_id_idx";
  ALTER TABLE "insights" DROP COLUMN "send_newsletter";
  ALTER TABLE "insights" DROP COLUMN "newsletter_sent_at";
  ALTER TABLE "insights" DROP COLUMN "newsletter_recipients";
  ALTER TABLE "_insights_v" DROP COLUMN "version_send_newsletter";
  ALTER TABLE "_insights_v" DROP COLUMN "version_newsletter_sent_at";
  ALTER TABLE "_insights_v" DROP COLUMN "version_newsletter_recipients";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "subscribers_id";
  DROP TYPE "public"."enum_subscribers_locale";
  DROP TYPE "public"."enum_subscribers_status";`)
}
