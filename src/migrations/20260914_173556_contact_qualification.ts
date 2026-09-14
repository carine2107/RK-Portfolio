import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contact_submissions_organisation_type" AS ENUM('company', 'sme', 'startup', 'publicInstitution', 'ngo', 'investor', 'individual');
  CREATE TYPE "public"."enum_contact_submissions_budget" AS ENUM('under5k', 'from5to20k', 'from20to50k', 'over50k', 'notDefined');
  CREATE TYPE "public"."enum_contact_submissions_timeline" AS ENUM('urgent', 'quarter', 'later', 'exploring');
  CREATE TYPE "public"."enum_contact_submissions_decision_role" AS ENUM('decisionMaker', 'influencer', 'researching');
  CREATE TYPE "public"."enum_contact_submissions_priority" AS ENUM('high', 'medium', 'low');
  ALTER TABLE "contact_submissions" ADD COLUMN "organisation_type" "enum_contact_submissions_organisation_type";
  ALTER TABLE "contact_submissions" ADD COLUMN "budget" "enum_contact_submissions_budget";
  ALTER TABLE "contact_submissions" ADD COLUMN "timeline" "enum_contact_submissions_timeline";
  ALTER TABLE "contact_submissions" ADD COLUMN "decision_role" "enum_contact_submissions_decision_role";
  ALTER TABLE "contact_submissions" ADD COLUMN "priority" "enum_contact_submissions_priority";
  ALTER TABLE "contact_submissions" ADD COLUMN "lead_score" numeric;
  CREATE INDEX "contact_submissions_priority_idx" ON "contact_submissions" USING btree ("priority");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "contact_submissions_priority_idx";
  ALTER TABLE "contact_submissions" DROP COLUMN "organisation_type";
  ALTER TABLE "contact_submissions" DROP COLUMN "budget";
  ALTER TABLE "contact_submissions" DROP COLUMN "timeline";
  ALTER TABLE "contact_submissions" DROP COLUMN "decision_role";
  ALTER TABLE "contact_submissions" DROP COLUMN "priority";
  ALTER TABLE "contact_submissions" DROP COLUMN "lead_score";
  DROP TYPE "public"."enum_contact_submissions_organisation_type";
  DROP TYPE "public"."enum_contact_submissions_budget";
  DROP TYPE "public"."enum_contact_submissions_timeline";
  DROP TYPE "public"."enum_contact_submissions_decision_role";
  DROP TYPE "public"."enum_contact_submissions_priority";`)
}
