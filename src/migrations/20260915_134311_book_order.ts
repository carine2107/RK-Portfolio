import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_contact_submissions_request_type" ADD VALUE 'bookOrder' BEFORE 'other';
  ALTER TABLE "books" ADD COLUMN "direct_order_form" boolean DEFAULT false;
  ALTER TABLE "_books_v" ADD COLUMN "version_direct_order_form" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_submissions" ALTER COLUMN "request_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_contact_submissions_request_type";
  CREATE TYPE "public"."enum_contact_submissions_request_type" AS ENUM('consulting', 'dueDiligence', 'advisory', 'projectManagement', 'smeProgramme', 'training', 'speaking', 'partnership', 'other');
  ALTER TABLE "contact_submissions" ALTER COLUMN "request_type" SET DATA TYPE "public"."enum_contact_submissions_request_type" USING "request_type"::"public"."enum_contact_submissions_request_type";
  ALTER TABLE "books" DROP COLUMN "direct_order_form";
  ALTER TABLE "_books_v" DROP COLUMN "version_direct_order_form";`)
}
