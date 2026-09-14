import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_engagements_languages" AS ENUM('fr', 'en', 'de');
  CREATE TYPE "public"."enum_engagements_type" AS ENUM('conference', 'workshop', 'panel', 'interview', 'podcast', 'video', 'press');
  CREATE TYPE "public"."enum_engagements_country" AS ENUM('AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AR', 'AT', 'AU', 'AW', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BN', 'BO', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ', 'CA', 'CD', 'CF', 'CG', 'CH', 'CI', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FR', 'GA', 'GB', 'GD', 'GE', 'GH', 'GM', 'GN', 'GQ', 'GR', 'GT', 'GW', 'GY', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IN', 'IQ', 'IR', 'IS', 'IT', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KM', 'KN', 'KP', 'KR', 'KW', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MR', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NE', 'NG', 'NI', 'NL', 'NO', 'NP', 'NZ', 'OM', 'PA', 'PE', 'PG', 'PH', 'PK', 'PL', 'PT', 'PY', 'QA', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SI', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SY', 'SZ', 'TD', 'TG', 'TH', 'TJ', 'TL', 'TM', 'TN', 'TR', 'TT', 'TW', 'TZ', 'UA', 'UG', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VN', 'VU', 'WS', 'YE', 'ZA', 'ZM', 'ZW');
  CREATE TYPE "public"."enum_engagements_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__engagements_v_version_languages" AS ENUM('fr', 'en', 'de');
  CREATE TYPE "public"."enum__engagements_v_version_type" AS ENUM('conference', 'workshop', 'panel', 'interview', 'podcast', 'video', 'press');
  CREATE TYPE "public"."enum__engagements_v_version_country" AS ENUM('AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AR', 'AT', 'AU', 'AW', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BN', 'BO', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ', 'CA', 'CD', 'CF', 'CG', 'CH', 'CI', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FR', 'GA', 'GB', 'GD', 'GE', 'GH', 'GM', 'GN', 'GQ', 'GR', 'GT', 'GW', 'GY', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IN', 'IQ', 'IR', 'IS', 'IT', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KM', 'KN', 'KP', 'KR', 'KW', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MR', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NE', 'NG', 'NI', 'NL', 'NO', 'NP', 'NZ', 'OM', 'PA', 'PE', 'PG', 'PH', 'PK', 'PL', 'PT', 'PY', 'QA', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SI', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SY', 'SZ', 'TD', 'TG', 'TH', 'TJ', 'TL', 'TM', 'TN', 'TR', 'TT', 'TW', 'TZ', 'UA', 'UG', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VN', 'VU', 'WS', 'YE', 'ZA', 'ZM', 'ZW');
  CREATE TYPE "public"."enum__engagements_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__engagements_v_published_locale" AS ENUM('en', 'fr', 'de');
  CREATE TABLE "engagements_languages" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_engagements_languages",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "engagements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_engagements_type",
  	"date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"organiser" varchar,
  	"country" "enum_engagements_country",
  	"cover_id" integer,
  	"featured" boolean DEFAULT false,
  	"is_placeholder" boolean DEFAULT false,
  	"video_url" varchar,
  	"external_url" varchar,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_engagements_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "engagements_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"summary" varchar,
  	"event_name" varchar,
  	"city" varchar,
  	"description" jsonb,
  	"external_label" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_engagements_v_version_languages" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__engagements_v_version_languages",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_engagements_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_type" "enum__engagements_v_version_type",
  	"version_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_organiser" varchar,
  	"version_country" "enum__engagements_v_version_country",
  	"version_cover_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_is_placeholder" boolean DEFAULT false,
  	"version_video_url" varchar,
  	"version_external_url" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__engagements_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__engagements_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_engagements_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_summary" varchar,
  	"version_event_name" varchar,
  	"version_city" varchar,
  	"version_description" jsonb,
  	"version_external_label" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "engagements_id" integer;
  ALTER TABLE "engagements_languages" ADD CONSTRAINT "engagements_languages_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "engagements" ADD CONSTRAINT "engagements_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "engagements" ADD CONSTRAINT "engagements_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "engagements_locales" ADD CONSTRAINT "engagements_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_engagements_v_version_languages" ADD CONSTRAINT "_engagements_v_version_languages_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_engagements_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_engagements_v" ADD CONSTRAINT "_engagements_v_parent_id_engagements_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."engagements"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_engagements_v" ADD CONSTRAINT "_engagements_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_engagements_v" ADD CONSTRAINT "_engagements_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_engagements_v_locales" ADD CONSTRAINT "_engagements_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_engagements_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "engagements_languages_order_idx" ON "engagements_languages" USING btree ("order");
  CREATE INDEX "engagements_languages_parent_idx" ON "engagements_languages" USING btree ("parent_id");
  CREATE INDEX "engagements_cover_idx" ON "engagements" USING btree ("cover_id");
  CREATE INDEX "engagements_seo_seo_image_idx" ON "engagements" USING btree ("seo_image_id");
  CREATE INDEX "engagements_updated_at_idx" ON "engagements" USING btree ("updated_at");
  CREATE INDEX "engagements_created_at_idx" ON "engagements" USING btree ("created_at");
  CREATE INDEX "engagements__status_idx" ON "engagements" USING btree ("_status");
  CREATE INDEX "engagements_slug_idx" ON "engagements_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "engagements_locales_locale_parent_id_unique" ON "engagements_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_engagements_v_version_languages_order_idx" ON "_engagements_v_version_languages" USING btree ("order");
  CREATE INDEX "_engagements_v_version_languages_parent_idx" ON "_engagements_v_version_languages" USING btree ("parent_id");
  CREATE INDEX "_engagements_v_parent_idx" ON "_engagements_v" USING btree ("parent_id");
  CREATE INDEX "_engagements_v_version_version_cover_idx" ON "_engagements_v" USING btree ("version_cover_id");
  CREATE INDEX "_engagements_v_version_seo_version_seo_image_idx" ON "_engagements_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_engagements_v_version_version_updated_at_idx" ON "_engagements_v" USING btree ("version_updated_at");
  CREATE INDEX "_engagements_v_version_version_created_at_idx" ON "_engagements_v" USING btree ("version_created_at");
  CREATE INDEX "_engagements_v_version_version__status_idx" ON "_engagements_v" USING btree ("version__status");
  CREATE INDEX "_engagements_v_created_at_idx" ON "_engagements_v" USING btree ("created_at");
  CREATE INDEX "_engagements_v_updated_at_idx" ON "_engagements_v" USING btree ("updated_at");
  CREATE INDEX "_engagements_v_snapshot_idx" ON "_engagements_v" USING btree ("snapshot");
  CREATE INDEX "_engagements_v_published_locale_idx" ON "_engagements_v" USING btree ("published_locale");
  CREATE INDEX "_engagements_v_latest_idx" ON "_engagements_v" USING btree ("latest");
  CREATE INDEX "_engagements_v_version_version_slug_idx" ON "_engagements_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_engagements_v_locales_locale_parent_id_unique" ON "_engagements_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_engagements_fk" FOREIGN KEY ("engagements_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_engagements_id_idx" ON "payload_locked_documents_rels" USING btree ("engagements_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "engagements_languages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "engagements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "engagements_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_engagements_v_version_languages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_engagements_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_engagements_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "engagements_languages" CASCADE;
  DROP TABLE "engagements" CASCADE;
  DROP TABLE "engagements_locales" CASCADE;
  DROP TABLE "_engagements_v_version_languages" CASCADE;
  DROP TABLE "_engagements_v" CASCADE;
  DROP TABLE "_engagements_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_engagements_fk";
  
  DROP INDEX "payload_locked_documents_rels_engagements_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "engagements_id";
  DROP TYPE "public"."enum_engagements_languages";
  DROP TYPE "public"."enum_engagements_type";
  DROP TYPE "public"."enum_engagements_country";
  DROP TYPE "public"."enum_engagements_status";
  DROP TYPE "public"."enum__engagements_v_version_languages";
  DROP TYPE "public"."enum__engagements_v_version_type";
  DROP TYPE "public"."enum__engagements_v_version_country";
  DROP TYPE "public"."enum__engagements_v_version_status";
  DROP TYPE "public"."enum__engagements_v_published_locale";`)
}
