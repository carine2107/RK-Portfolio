import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "engagements_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"expertise_areas_id" integer
  );
  
  CREATE TABLE "_engagements_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"expertise_areas_id" integer
  );
  
  ALTER TABLE "engagements" ADD COLUMN "duration_minutes" numeric;
  ALTER TABLE "_engagements_v" ADD COLUMN "version_duration_minutes" numeric;
  ALTER TABLE "engagements_rels" ADD CONSTRAINT "engagements_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "engagements_rels" ADD CONSTRAINT "engagements_rels_expertise_areas_fk" FOREIGN KEY ("expertise_areas_id") REFERENCES "public"."expertise_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_engagements_v_rels" ADD CONSTRAINT "_engagements_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_engagements_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_engagements_v_rels" ADD CONSTRAINT "_engagements_v_rels_expertise_areas_fk" FOREIGN KEY ("expertise_areas_id") REFERENCES "public"."expertise_areas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "engagements_rels_order_idx" ON "engagements_rels" USING btree ("order");
  CREATE INDEX "engagements_rels_parent_idx" ON "engagements_rels" USING btree ("parent_id");
  CREATE INDEX "engagements_rels_path_idx" ON "engagements_rels" USING btree ("path");
  CREATE INDEX "engagements_rels_expertise_areas_id_idx" ON "engagements_rels" USING btree ("expertise_areas_id");
  CREATE INDEX "_engagements_v_rels_order_idx" ON "_engagements_v_rels" USING btree ("order");
  CREATE INDEX "_engagements_v_rels_parent_idx" ON "_engagements_v_rels" USING btree ("parent_id");
  CREATE INDEX "_engagements_v_rels_path_idx" ON "_engagements_v_rels" USING btree ("path");
  CREATE INDEX "_engagements_v_rels_expertise_areas_id_idx" ON "_engagements_v_rels" USING btree ("expertise_areas_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "engagements_rels" CASCADE;
  DROP TABLE "_engagements_v_rels" CASCADE;
  ALTER TABLE "engagements" DROP COLUMN "duration_minutes";
  ALTER TABLE "_engagements_v" DROP COLUMN "version_duration_minutes";`)
}
