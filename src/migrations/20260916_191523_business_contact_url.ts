import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "businesses" ADD COLUMN "contact_url" varchar;
  ALTER TABLE "_businesses_v" ADD COLUMN "version_contact_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "businesses" DROP COLUMN "contact_url";
  ALTER TABLE "_businesses_v" DROP COLUMN "version_contact_url";`)
}
