import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_submissions" ADD COLUMN "business_id" integer;
  ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "contact_submissions_business_idx" ON "contact_submissions" USING btree ("business_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_submissions" DROP CONSTRAINT "contact_submissions_business_id_businesses_id_fk";
  
  DROP INDEX "contact_submissions_business_idx";
  ALTER TABLE "contact_submissions" DROP COLUMN "business_id";`)
}
