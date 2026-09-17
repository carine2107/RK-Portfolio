import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contact_submissions_history_action" AS ENUM('statusChanged', 'followUpSet', 'followUpCleared', 'reminderSent');
  CREATE TYPE "public"."enum_contact_submissions_history_from_status" AS ENUM('new', 'inProgress', 'answered', 'archived');
  CREATE TYPE "public"."enum_contact_submissions_history_to_status" AS ENUM('new', 'inProgress', 'answered', 'archived');
  CREATE TYPE "public"."enum_reply_templates_request_types" AS ENUM('consulting', 'dueDiligence', 'advisory', 'projectManagement', 'smeProgramme', 'training', 'speaking', 'partnership', 'bookOrder', 'other');
  CREATE TABLE "contact_submissions_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"at" timestamp(3) with time zone,
  	"author" varchar
  );
  
  CREATE TABLE "contact_submissions_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"at" timestamp(3) with time zone,
  	"action" "enum_contact_submissions_history_action",
  	"author" varchar,
  	"from_status" "enum_contact_submissions_history_from_status",
  	"to_status" "enum_contact_submissions_history_to_status",
  	"date" timestamp(3) with time zone
  );
  
  CREATE TABLE "reply_templates_request_types" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_reply_templates_request_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "reply_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reply_templates_locales" (
  	"subject" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "contact_submissions" ADD COLUMN "follow_up_at" timestamp(3) with time zone;
  ALTER TABLE "contact_submissions" ADD COLUMN "follow_up_reminder_sent_at" timestamp(3) with time zone;
  ALTER TABLE "contact_submissions" ADD COLUMN "answered_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reply_templates_id" integer;
  ALTER TABLE "contact_submissions_notes" ADD CONSTRAINT "contact_submissions_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_submissions_history" ADD CONSTRAINT "contact_submissions_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reply_templates_request_types" ADD CONSTRAINT "reply_templates_request_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reply_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reply_templates_locales" ADD CONSTRAINT "reply_templates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reply_templates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "contact_submissions_notes_order_idx" ON "contact_submissions_notes" USING btree ("_order");
  CREATE INDEX "contact_submissions_notes_parent_id_idx" ON "contact_submissions_notes" USING btree ("_parent_id");
  CREATE INDEX "contact_submissions_history_order_idx" ON "contact_submissions_history" USING btree ("_order");
  CREATE INDEX "contact_submissions_history_parent_id_idx" ON "contact_submissions_history" USING btree ("_parent_id");
  CREATE INDEX "reply_templates_request_types_order_idx" ON "reply_templates_request_types" USING btree ("order");
  CREATE INDEX "reply_templates_request_types_parent_idx" ON "reply_templates_request_types" USING btree ("parent_id");
  CREATE INDEX "reply_templates_updated_at_idx" ON "reply_templates" USING btree ("updated_at");
  CREATE INDEX "reply_templates_created_at_idx" ON "reply_templates" USING btree ("created_at");
  CREATE UNIQUE INDEX "reply_templates_locales_locale_parent_id_unique" ON "reply_templates_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reply_templates_fk" FOREIGN KEY ("reply_templates_id") REFERENCES "public"."reply_templates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_reply_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("reply_templates_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_submissions_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_submissions_history" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reply_templates_request_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reply_templates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reply_templates_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "contact_submissions_notes" CASCADE;
  DROP TABLE "contact_submissions_history" CASCADE;
  DROP TABLE "reply_templates_request_types" CASCADE;
  DROP TABLE "reply_templates" CASCADE;
  DROP TABLE "reply_templates_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reply_templates_fk";
  
  DROP INDEX "payload_locked_documents_rels_reply_templates_id_idx";
  ALTER TABLE "contact_submissions" DROP COLUMN "follow_up_at";
  ALTER TABLE "contact_submissions" DROP COLUMN "follow_up_reminder_sent_at";
  ALTER TABLE "contact_submissions" DROP COLUMN "answered_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reply_templates_id";
  DROP TYPE "public"."enum_contact_submissions_history_action";
  DROP TYPE "public"."enum_contact_submissions_history_from_status";
  DROP TYPE "public"."enum_contact_submissions_history_to_status";
  DROP TYPE "public"."enum_reply_templates_request_types";`)
}
