import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_languages" AS ENUM('fr', 'de', 'en');
  CREATE TYPE "public"."enum_products_type" AS ENUM('ebook', 'course', 'resource');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_languages" AS ENUM('fr', 'de', 'en');
  CREATE TYPE "public"."enum__products_v_version_type" AS ENUM('ebook', 'course', 'resource');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_published_locale" AS ENUM('en', 'fr', 'de');
  CREATE TYPE "public"."enum_members_locale" AS ENUM('fr', 'de', 'en');
  CREATE TABLE "products_languages" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_languages",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_modules_lessons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"duration_minutes" numeric,
  	"video_url" varchar,
  	"attachment_id" integer
  );
  
  CREATE TABLE "products_modules_lessons_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_modules_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_products_type" DEFAULT 'ebook',
  	"price" numeric,
  	"available" boolean DEFAULT true,
  	"cover_id" integer,
  	"ebook_pdf_id" integer,
  	"ebook_epub_id" integer,
  	"resource_file_id" integer,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 100,
  	"is_placeholder" boolean DEFAULT false,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"summary" varchar,
  	"description" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_version_languages" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_languages",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v_version_modules_lessons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"duration_minutes" numeric,
  	"video_url" varchar,
  	"attachment_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_modules_lessons_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_version_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_modules_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_type" "enum__products_v_version_type" DEFAULT 'ebook',
  	"version_price" numeric,
  	"version_available" boolean DEFAULT true,
  	"version_cover_id" integer,
  	"version_ebook_pdf_id" integer,
  	"version_ebook_epub_id" integer,
  	"version_resource_file_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 100,
  	"version_is_placeholder" boolean DEFAULT false,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__products_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_summary" varchar,
  	"version_description" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "protected_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"name" varchar,
  	"locale" "enum_members_locale" DEFAULT 'en' NOT NULL,
  	"last_login_at" timestamp(3) with time zone,
  	"login_nonce" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "entitlements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer NOT NULL,
  	"product_id" integer NOT NULL,
  	"order_id" integer,
  	"granted_at" timestamp(3) with time zone,
  	"downloads" numeric DEFAULT 0,
  	"completed_lessons" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "orders_items" ADD COLUMN "product_id" integer;
  ALTER TABLE "orders" ADD COLUMN "digital_waiver_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "protected_files_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "members_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "entitlements_id" integer;
  ALTER TABLE "products_languages" ADD CONSTRAINT "products_languages_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_modules_lessons" ADD CONSTRAINT "products_modules_lessons_attachment_id_protected_files_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."protected_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_modules_lessons" ADD CONSTRAINT "products_modules_lessons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_modules_lessons_locales" ADD CONSTRAINT "products_modules_lessons_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_modules_lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_modules" ADD CONSTRAINT "products_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_modules_locales" ADD CONSTRAINT "products_modules_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_ebook_pdf_id_protected_files_id_fk" FOREIGN KEY ("ebook_pdf_id") REFERENCES "public"."protected_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_ebook_epub_id_protected_files_id_fk" FOREIGN KEY ("ebook_epub_id") REFERENCES "public"."protected_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_resource_file_id_protected_files_id_fk" FOREIGN KEY ("resource_file_id") REFERENCES "public"."protected_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_languages" ADD CONSTRAINT "_products_v_version_languages_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_modules_lessons" ADD CONSTRAINT "_products_v_version_modules_lessons_attachment_id_protected_files_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."protected_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_modules_lessons" ADD CONSTRAINT "_products_v_version_modules_lessons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_modules_lessons_locales" ADD CONSTRAINT "_products_v_version_modules_lessons_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_modules_lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_modules" ADD CONSTRAINT "_products_v_version_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_modules_locales" ADD CONSTRAINT "_products_v_version_modules_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_ebook_pdf_id_protected_files_id_fk" FOREIGN KEY ("version_ebook_pdf_id") REFERENCES "public"."protected_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_ebook_epub_id_protected_files_id_fk" FOREIGN KEY ("version_ebook_epub_id") REFERENCES "public"."protected_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_resource_file_id_protected_files_id_fk" FOREIGN KEY ("version_resource_file_id") REFERENCES "public"."protected_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_locales" ADD CONSTRAINT "_products_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_languages_order_idx" ON "products_languages" USING btree ("order");
  CREATE INDEX "products_languages_parent_idx" ON "products_languages" USING btree ("parent_id");
  CREATE INDEX "products_modules_lessons_order_idx" ON "products_modules_lessons" USING btree ("_order");
  CREATE INDEX "products_modules_lessons_parent_id_idx" ON "products_modules_lessons" USING btree ("_parent_id");
  CREATE INDEX "products_modules_lessons_attachment_idx" ON "products_modules_lessons" USING btree ("attachment_id");
  CREATE UNIQUE INDEX "products_modules_lessons_locales_locale_parent_id_unique" ON "products_modules_lessons_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_modules_order_idx" ON "products_modules" USING btree ("_order");
  CREATE INDEX "products_modules_parent_id_idx" ON "products_modules" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_modules_locales_locale_parent_id_unique" ON "products_modules_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_cover_idx" ON "products" USING btree ("cover_id");
  CREATE INDEX "products_ebook_pdf_idx" ON "products" USING btree ("ebook_pdf_id");
  CREATE INDEX "products_ebook_epub_idx" ON "products" USING btree ("ebook_epub_id");
  CREATE INDEX "products_resource_file_idx" ON "products" USING btree ("resource_file_id");
  CREATE INDEX "products_seo_seo_image_idx" ON "products" USING btree ("seo_image_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "products_slug_idx" ON "products_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_languages_order_idx" ON "_products_v_version_languages" USING btree ("order");
  CREATE INDEX "_products_v_version_languages_parent_idx" ON "_products_v_version_languages" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_modules_lessons_order_idx" ON "_products_v_version_modules_lessons" USING btree ("_order");
  CREATE INDEX "_products_v_version_modules_lessons_parent_id_idx" ON "_products_v_version_modules_lessons" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_modules_lessons_attachment_idx" ON "_products_v_version_modules_lessons" USING btree ("attachment_id");
  CREATE UNIQUE INDEX "_products_v_version_modules_lessons_locales_locale_parent_id" ON "_products_v_version_modules_lessons_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_modules_order_idx" ON "_products_v_version_modules" USING btree ("_order");
  CREATE INDEX "_products_v_version_modules_parent_id_idx" ON "_products_v_version_modules" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_products_v_version_modules_locales_locale_parent_id_unique" ON "_products_v_version_modules_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_cover_idx" ON "_products_v" USING btree ("version_cover_id");
  CREATE INDEX "_products_v_version_version_ebook_pdf_idx" ON "_products_v" USING btree ("version_ebook_pdf_id");
  CREATE INDEX "_products_v_version_version_ebook_epub_idx" ON "_products_v" USING btree ("version_ebook_epub_id");
  CREATE INDEX "_products_v_version_version_resource_file_idx" ON "_products_v" USING btree ("version_resource_file_id");
  CREATE INDEX "_products_v_version_seo_version_seo_image_idx" ON "_products_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_snapshot_idx" ON "_products_v" USING btree ("snapshot");
  CREATE INDEX "_products_v_published_locale_idx" ON "_products_v" USING btree ("published_locale");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_products_v_locales_locale_parent_id_unique" ON "_products_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "protected_files_updated_at_idx" ON "protected_files" USING btree ("updated_at");
  CREATE INDEX "protected_files_created_at_idx" ON "protected_files" USING btree ("created_at");
  CREATE UNIQUE INDEX "protected_files_filename_idx" ON "protected_files" USING btree ("filename");
  CREATE UNIQUE INDEX "members_email_idx" ON "members" USING btree ("email");
  CREATE INDEX "members_updated_at_idx" ON "members" USING btree ("updated_at");
  CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");
  CREATE INDEX "entitlements_member_idx" ON "entitlements" USING btree ("member_id");
  CREATE INDEX "entitlements_product_idx" ON "entitlements" USING btree ("product_id");
  CREATE INDEX "entitlements_order_idx" ON "entitlements" USING btree ("order_id");
  CREATE INDEX "entitlements_updated_at_idx" ON "entitlements" USING btree ("updated_at");
  CREATE INDEX "entitlements_created_at_idx" ON "entitlements" USING btree ("created_at");
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_protected_files_fk" FOREIGN KEY ("protected_files_id") REFERENCES "public"."protected_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_entitlements_fk" FOREIGN KEY ("entitlements_id") REFERENCES "public"."entitlements"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "orders_items_product_idx" ON "orders_items" USING btree ("product_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_protected_files_id_idx" ON "payload_locked_documents_rels" USING btree ("protected_files_id");
  CREATE INDEX "payload_locked_documents_rels_members_id_idx" ON "payload_locked_documents_rels" USING btree ("members_id");
  CREATE INDEX "payload_locked_documents_rels_entitlements_id_idx" ON "payload_locked_documents_rels" USING btree ("entitlements_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_languages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_modules_lessons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_modules_lessons_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_modules_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_languages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_modules_lessons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_modules_lessons_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_modules_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "protected_files" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "members" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "entitlements" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_languages" CASCADE;
  DROP TABLE "products_modules_lessons" CASCADE;
  DROP TABLE "products_modules_lessons_locales" CASCADE;
  DROP TABLE "products_modules" CASCADE;
  DROP TABLE "products_modules_locales" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_locales" CASCADE;
  DROP TABLE "_products_v_version_languages" CASCADE;
  DROP TABLE "_products_v_version_modules_lessons" CASCADE;
  DROP TABLE "_products_v_version_modules_lessons_locales" CASCADE;
  DROP TABLE "_products_v_version_modules" CASCADE;
  DROP TABLE "_products_v_version_modules_locales" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_locales" CASCADE;
  DROP TABLE "protected_files" CASCADE;
  DROP TABLE "members" CASCADE;
  DROP TABLE "entitlements" CASCADE;
  ALTER TABLE "orders_items" DROP CONSTRAINT "orders_items_product_id_products_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_products_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_protected_files_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_members_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_entitlements_fk";
  
  DROP INDEX "orders_items_product_idx";
  DROP INDEX "payload_locked_documents_rels_products_id_idx";
  DROP INDEX "payload_locked_documents_rels_protected_files_id_idx";
  DROP INDEX "payload_locked_documents_rels_members_id_idx";
  DROP INDEX "payload_locked_documents_rels_entitlements_id_idx";
  ALTER TABLE "orders_items" DROP COLUMN "product_id";
  ALTER TABLE "orders" DROP COLUMN "digital_waiver_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "products_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "protected_files_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "members_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "entitlements_id";
  DROP TYPE "public"."enum_products_languages";
  DROP TYPE "public"."enum_products_type";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_languages";
  DROP TYPE "public"."enum__products_v_version_type";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum__products_v_published_locale";
  DROP TYPE "public"."enum_members_locale";`)
}
