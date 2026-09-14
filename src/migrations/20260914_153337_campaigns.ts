import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_campaigns_blocks_text_image_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_campaigns_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__campaigns_v_blocks_text_image_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__campaigns_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__campaigns_v_published_locale" AS ENUM('en', 'fr', 'de');
  CREATE TABLE "campaigns_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "campaigns_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "campaigns_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_position" "enum_campaigns_blocks_text_image_position" DEFAULT 'right',
  	"block_name" varchar
  );
  
  CREATE TABLE "campaigns_blocks_text_locales" (
  	"heading" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "campaigns_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "campaigns_blocks_features_items_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "campaigns_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "campaigns_blocks_features_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "campaigns_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_url" varchar,
  	"poster_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "campaigns_blocks_video_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "campaigns_blocks_books" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "campaigns_blocks_books_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "campaigns_blocks_products" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "campaigns_blocks_products_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "campaigns_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "campaigns_blocks_faq_items_locales" (
  	"question" varchar,
  	"answer" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "campaigns_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "campaigns_blocks_faq_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "campaigns_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"primary_href" varchar,
  	"secondary_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "campaigns_blocks_cta_locales" (
  	"heading" varchar,
  	"body" varchar,
  	"primary_label" varchar,
  	"secondary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "campaigns_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "campaigns_blocks_newsletter_locales" (
  	"heading" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "campaigns" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_campaigns_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "campaigns_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"summary" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "campaigns_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"books_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "_campaigns_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"cta_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_campaigns_v_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_campaigns_v_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_position" "enum__campaigns_v_blocks_text_image_position" DEFAULT 'right',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_campaigns_v_blocks_text_locales" (
  	"heading" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_campaigns_v_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_campaigns_v_blocks_features_items_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_campaigns_v_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_campaigns_v_blocks_features_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_campaigns_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_url" varchar,
  	"poster_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_campaigns_v_blocks_video_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_campaigns_v_blocks_books" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_campaigns_v_blocks_books_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_campaigns_v_blocks_products" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_campaigns_v_blocks_products_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_campaigns_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_campaigns_v_blocks_faq_items_locales" (
  	"question" varchar,
  	"answer" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_campaigns_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_campaigns_v_blocks_faq_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_campaigns_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"primary_href" varchar,
  	"secondary_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_campaigns_v_blocks_cta_locales" (
  	"heading" varchar,
  	"body" varchar,
  	"primary_label" varchar,
  	"secondary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_campaigns_v_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_campaigns_v_blocks_newsletter_locales" (
  	"heading" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_campaigns_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__campaigns_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__campaigns_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_campaigns_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_summary" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_campaigns_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"books_id" integer,
  	"products_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "campaigns_id" integer;
  ALTER TABLE "campaigns_blocks_hero" ADD CONSTRAINT "campaigns_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_hero" ADD CONSTRAINT "campaigns_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_hero_locales" ADD CONSTRAINT "campaigns_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_text" ADD CONSTRAINT "campaigns_blocks_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_text" ADD CONSTRAINT "campaigns_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_text_locales" ADD CONSTRAINT "campaigns_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_features_items" ADD CONSTRAINT "campaigns_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_features_items_locales" ADD CONSTRAINT "campaigns_blocks_features_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns_blocks_features_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_features" ADD CONSTRAINT "campaigns_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_features_locales" ADD CONSTRAINT "campaigns_blocks_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_video" ADD CONSTRAINT "campaigns_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_video" ADD CONSTRAINT "campaigns_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_video_locales" ADD CONSTRAINT "campaigns_blocks_video_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_books" ADD CONSTRAINT "campaigns_blocks_books_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_books_locales" ADD CONSTRAINT "campaigns_blocks_books_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns_blocks_books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_products" ADD CONSTRAINT "campaigns_blocks_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_products_locales" ADD CONSTRAINT "campaigns_blocks_products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns_blocks_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_faq_items" ADD CONSTRAINT "campaigns_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_faq_items_locales" ADD CONSTRAINT "campaigns_blocks_faq_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns_blocks_faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_faq" ADD CONSTRAINT "campaigns_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_faq_locales" ADD CONSTRAINT "campaigns_blocks_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_cta" ADD CONSTRAINT "campaigns_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_cta_locales" ADD CONSTRAINT "campaigns_blocks_cta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_newsletter" ADD CONSTRAINT "campaigns_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_blocks_newsletter_locales" ADD CONSTRAINT "campaigns_blocks_newsletter_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns_blocks_newsletter"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "campaigns_locales" ADD CONSTRAINT "campaigns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_rels" ADD CONSTRAINT "campaigns_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_rels" ADD CONSTRAINT "campaigns_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaigns_rels" ADD CONSTRAINT "campaigns_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_hero" ADD CONSTRAINT "_campaigns_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_hero" ADD CONSTRAINT "_campaigns_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_hero_locales" ADD CONSTRAINT "_campaigns_v_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_text" ADD CONSTRAINT "_campaigns_v_blocks_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_text" ADD CONSTRAINT "_campaigns_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_text_locales" ADD CONSTRAINT "_campaigns_v_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_features_items" ADD CONSTRAINT "_campaigns_v_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_features_items_locales" ADD CONSTRAINT "_campaigns_v_blocks_features_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v_blocks_features_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_features" ADD CONSTRAINT "_campaigns_v_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_features_locales" ADD CONSTRAINT "_campaigns_v_blocks_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_video" ADD CONSTRAINT "_campaigns_v_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_video" ADD CONSTRAINT "_campaigns_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_video_locales" ADD CONSTRAINT "_campaigns_v_blocks_video_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_books" ADD CONSTRAINT "_campaigns_v_blocks_books_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_books_locales" ADD CONSTRAINT "_campaigns_v_blocks_books_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v_blocks_books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_products" ADD CONSTRAINT "_campaigns_v_blocks_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_products_locales" ADD CONSTRAINT "_campaigns_v_blocks_products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v_blocks_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_faq_items" ADD CONSTRAINT "_campaigns_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_faq_items_locales" ADD CONSTRAINT "_campaigns_v_blocks_faq_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v_blocks_faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_faq" ADD CONSTRAINT "_campaigns_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_faq_locales" ADD CONSTRAINT "_campaigns_v_blocks_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_cta" ADD CONSTRAINT "_campaigns_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_cta_locales" ADD CONSTRAINT "_campaigns_v_blocks_cta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_newsletter" ADD CONSTRAINT "_campaigns_v_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_blocks_newsletter_locales" ADD CONSTRAINT "_campaigns_v_blocks_newsletter_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v_blocks_newsletter"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v" ADD CONSTRAINT "_campaigns_v_parent_id_campaigns_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_campaigns_v" ADD CONSTRAINT "_campaigns_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_campaigns_v_locales" ADD CONSTRAINT "_campaigns_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campaigns_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_rels" ADD CONSTRAINT "_campaigns_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_campaigns_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_rels" ADD CONSTRAINT "_campaigns_v_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campaigns_v_rels" ADD CONSTRAINT "_campaigns_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "campaigns_blocks_hero_order_idx" ON "campaigns_blocks_hero" USING btree ("_order");
  CREATE INDEX "campaigns_blocks_hero_parent_id_idx" ON "campaigns_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "campaigns_blocks_hero_path_idx" ON "campaigns_blocks_hero" USING btree ("_path");
  CREATE INDEX "campaigns_blocks_hero_image_idx" ON "campaigns_blocks_hero" USING btree ("image_id");
  CREATE UNIQUE INDEX "campaigns_blocks_hero_locales_locale_parent_id_unique" ON "campaigns_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "campaigns_blocks_text_order_idx" ON "campaigns_blocks_text" USING btree ("_order");
  CREATE INDEX "campaigns_blocks_text_parent_id_idx" ON "campaigns_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "campaigns_blocks_text_path_idx" ON "campaigns_blocks_text" USING btree ("_path");
  CREATE INDEX "campaigns_blocks_text_image_idx" ON "campaigns_blocks_text" USING btree ("image_id");
  CREATE UNIQUE INDEX "campaigns_blocks_text_locales_locale_parent_id_unique" ON "campaigns_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "campaigns_blocks_features_items_order_idx" ON "campaigns_blocks_features_items" USING btree ("_order");
  CREATE INDEX "campaigns_blocks_features_items_parent_id_idx" ON "campaigns_blocks_features_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "campaigns_blocks_features_items_locales_locale_parent_id_uni" ON "campaigns_blocks_features_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "campaigns_blocks_features_order_idx" ON "campaigns_blocks_features" USING btree ("_order");
  CREATE INDEX "campaigns_blocks_features_parent_id_idx" ON "campaigns_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "campaigns_blocks_features_path_idx" ON "campaigns_blocks_features" USING btree ("_path");
  CREATE UNIQUE INDEX "campaigns_blocks_features_locales_locale_parent_id_unique" ON "campaigns_blocks_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "campaigns_blocks_video_order_idx" ON "campaigns_blocks_video" USING btree ("_order");
  CREATE INDEX "campaigns_blocks_video_parent_id_idx" ON "campaigns_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "campaigns_blocks_video_path_idx" ON "campaigns_blocks_video" USING btree ("_path");
  CREATE INDEX "campaigns_blocks_video_poster_idx" ON "campaigns_blocks_video" USING btree ("poster_id");
  CREATE UNIQUE INDEX "campaigns_blocks_video_locales_locale_parent_id_unique" ON "campaigns_blocks_video_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "campaigns_blocks_books_order_idx" ON "campaigns_blocks_books" USING btree ("_order");
  CREATE INDEX "campaigns_blocks_books_parent_id_idx" ON "campaigns_blocks_books" USING btree ("_parent_id");
  CREATE INDEX "campaigns_blocks_books_path_idx" ON "campaigns_blocks_books" USING btree ("_path");
  CREATE UNIQUE INDEX "campaigns_blocks_books_locales_locale_parent_id_unique" ON "campaigns_blocks_books_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "campaigns_blocks_products_order_idx" ON "campaigns_blocks_products" USING btree ("_order");
  CREATE INDEX "campaigns_blocks_products_parent_id_idx" ON "campaigns_blocks_products" USING btree ("_parent_id");
  CREATE INDEX "campaigns_blocks_products_path_idx" ON "campaigns_blocks_products" USING btree ("_path");
  CREATE UNIQUE INDEX "campaigns_blocks_products_locales_locale_parent_id_unique" ON "campaigns_blocks_products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "campaigns_blocks_faq_items_order_idx" ON "campaigns_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "campaigns_blocks_faq_items_parent_id_idx" ON "campaigns_blocks_faq_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "campaigns_blocks_faq_items_locales_locale_parent_id_unique" ON "campaigns_blocks_faq_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "campaigns_blocks_faq_order_idx" ON "campaigns_blocks_faq" USING btree ("_order");
  CREATE INDEX "campaigns_blocks_faq_parent_id_idx" ON "campaigns_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "campaigns_blocks_faq_path_idx" ON "campaigns_blocks_faq" USING btree ("_path");
  CREATE UNIQUE INDEX "campaigns_blocks_faq_locales_locale_parent_id_unique" ON "campaigns_blocks_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "campaigns_blocks_cta_order_idx" ON "campaigns_blocks_cta" USING btree ("_order");
  CREATE INDEX "campaigns_blocks_cta_parent_id_idx" ON "campaigns_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "campaigns_blocks_cta_path_idx" ON "campaigns_blocks_cta" USING btree ("_path");
  CREATE UNIQUE INDEX "campaigns_blocks_cta_locales_locale_parent_id_unique" ON "campaigns_blocks_cta_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "campaigns_blocks_newsletter_order_idx" ON "campaigns_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "campaigns_blocks_newsletter_parent_id_idx" ON "campaigns_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "campaigns_blocks_newsletter_path_idx" ON "campaigns_blocks_newsletter" USING btree ("_path");
  CREATE UNIQUE INDEX "campaigns_blocks_newsletter_locales_locale_parent_id_unique" ON "campaigns_blocks_newsletter_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "campaigns_seo_seo_image_idx" ON "campaigns" USING btree ("seo_image_id");
  CREATE INDEX "campaigns_updated_at_idx" ON "campaigns" USING btree ("updated_at");
  CREATE INDEX "campaigns_created_at_idx" ON "campaigns" USING btree ("created_at");
  CREATE INDEX "campaigns__status_idx" ON "campaigns" USING btree ("_status");
  CREATE INDEX "campaigns_slug_idx" ON "campaigns_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "campaigns_locales_locale_parent_id_unique" ON "campaigns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "campaigns_rels_order_idx" ON "campaigns_rels" USING btree ("order");
  CREATE INDEX "campaigns_rels_parent_idx" ON "campaigns_rels" USING btree ("parent_id");
  CREATE INDEX "campaigns_rels_path_idx" ON "campaigns_rels" USING btree ("path");
  CREATE INDEX "campaigns_rels_books_id_idx" ON "campaigns_rels" USING btree ("books_id");
  CREATE INDEX "campaigns_rels_products_id_idx" ON "campaigns_rels" USING btree ("products_id");
  CREATE INDEX "_campaigns_v_blocks_hero_order_idx" ON "_campaigns_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_campaigns_v_blocks_hero_parent_id_idx" ON "_campaigns_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_campaigns_v_blocks_hero_path_idx" ON "_campaigns_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_campaigns_v_blocks_hero_image_idx" ON "_campaigns_v_blocks_hero" USING btree ("image_id");
  CREATE UNIQUE INDEX "_campaigns_v_blocks_hero_locales_locale_parent_id_unique" ON "_campaigns_v_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_campaigns_v_blocks_text_order_idx" ON "_campaigns_v_blocks_text" USING btree ("_order");
  CREATE INDEX "_campaigns_v_blocks_text_parent_id_idx" ON "_campaigns_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "_campaigns_v_blocks_text_path_idx" ON "_campaigns_v_blocks_text" USING btree ("_path");
  CREATE INDEX "_campaigns_v_blocks_text_image_idx" ON "_campaigns_v_blocks_text" USING btree ("image_id");
  CREATE UNIQUE INDEX "_campaigns_v_blocks_text_locales_locale_parent_id_unique" ON "_campaigns_v_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_campaigns_v_blocks_features_items_order_idx" ON "_campaigns_v_blocks_features_items" USING btree ("_order");
  CREATE INDEX "_campaigns_v_blocks_features_items_parent_id_idx" ON "_campaigns_v_blocks_features_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_campaigns_v_blocks_features_items_locales_locale_parent_id_" ON "_campaigns_v_blocks_features_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_campaigns_v_blocks_features_order_idx" ON "_campaigns_v_blocks_features" USING btree ("_order");
  CREATE INDEX "_campaigns_v_blocks_features_parent_id_idx" ON "_campaigns_v_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "_campaigns_v_blocks_features_path_idx" ON "_campaigns_v_blocks_features" USING btree ("_path");
  CREATE UNIQUE INDEX "_campaigns_v_blocks_features_locales_locale_parent_id_unique" ON "_campaigns_v_blocks_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_campaigns_v_blocks_video_order_idx" ON "_campaigns_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_campaigns_v_blocks_video_parent_id_idx" ON "_campaigns_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_campaigns_v_blocks_video_path_idx" ON "_campaigns_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_campaigns_v_blocks_video_poster_idx" ON "_campaigns_v_blocks_video" USING btree ("poster_id");
  CREATE UNIQUE INDEX "_campaigns_v_blocks_video_locales_locale_parent_id_unique" ON "_campaigns_v_blocks_video_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_campaigns_v_blocks_books_order_idx" ON "_campaigns_v_blocks_books" USING btree ("_order");
  CREATE INDEX "_campaigns_v_blocks_books_parent_id_idx" ON "_campaigns_v_blocks_books" USING btree ("_parent_id");
  CREATE INDEX "_campaigns_v_blocks_books_path_idx" ON "_campaigns_v_blocks_books" USING btree ("_path");
  CREATE UNIQUE INDEX "_campaigns_v_blocks_books_locales_locale_parent_id_unique" ON "_campaigns_v_blocks_books_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_campaigns_v_blocks_products_order_idx" ON "_campaigns_v_blocks_products" USING btree ("_order");
  CREATE INDEX "_campaigns_v_blocks_products_parent_id_idx" ON "_campaigns_v_blocks_products" USING btree ("_parent_id");
  CREATE INDEX "_campaigns_v_blocks_products_path_idx" ON "_campaigns_v_blocks_products" USING btree ("_path");
  CREATE UNIQUE INDEX "_campaigns_v_blocks_products_locales_locale_parent_id_unique" ON "_campaigns_v_blocks_products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_campaigns_v_blocks_faq_items_order_idx" ON "_campaigns_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_campaigns_v_blocks_faq_items_parent_id_idx" ON "_campaigns_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_campaigns_v_blocks_faq_items_locales_locale_parent_id_uniqu" ON "_campaigns_v_blocks_faq_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_campaigns_v_blocks_faq_order_idx" ON "_campaigns_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_campaigns_v_blocks_faq_parent_id_idx" ON "_campaigns_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_campaigns_v_blocks_faq_path_idx" ON "_campaigns_v_blocks_faq" USING btree ("_path");
  CREATE UNIQUE INDEX "_campaigns_v_blocks_faq_locales_locale_parent_id_unique" ON "_campaigns_v_blocks_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_campaigns_v_blocks_cta_order_idx" ON "_campaigns_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_campaigns_v_blocks_cta_parent_id_idx" ON "_campaigns_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_campaigns_v_blocks_cta_path_idx" ON "_campaigns_v_blocks_cta" USING btree ("_path");
  CREATE UNIQUE INDEX "_campaigns_v_blocks_cta_locales_locale_parent_id_unique" ON "_campaigns_v_blocks_cta_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_campaigns_v_blocks_newsletter_order_idx" ON "_campaigns_v_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "_campaigns_v_blocks_newsletter_parent_id_idx" ON "_campaigns_v_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "_campaigns_v_blocks_newsletter_path_idx" ON "_campaigns_v_blocks_newsletter" USING btree ("_path");
  CREATE UNIQUE INDEX "_campaigns_v_blocks_newsletter_locales_locale_parent_id_uniq" ON "_campaigns_v_blocks_newsletter_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_campaigns_v_parent_idx" ON "_campaigns_v" USING btree ("parent_id");
  CREATE INDEX "_campaigns_v_version_seo_version_seo_image_idx" ON "_campaigns_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_campaigns_v_version_version_updated_at_idx" ON "_campaigns_v" USING btree ("version_updated_at");
  CREATE INDEX "_campaigns_v_version_version_created_at_idx" ON "_campaigns_v" USING btree ("version_created_at");
  CREATE INDEX "_campaigns_v_version_version__status_idx" ON "_campaigns_v" USING btree ("version__status");
  CREATE INDEX "_campaigns_v_created_at_idx" ON "_campaigns_v" USING btree ("created_at");
  CREATE INDEX "_campaigns_v_updated_at_idx" ON "_campaigns_v" USING btree ("updated_at");
  CREATE INDEX "_campaigns_v_snapshot_idx" ON "_campaigns_v" USING btree ("snapshot");
  CREATE INDEX "_campaigns_v_published_locale_idx" ON "_campaigns_v" USING btree ("published_locale");
  CREATE INDEX "_campaigns_v_latest_idx" ON "_campaigns_v" USING btree ("latest");
  CREATE INDEX "_campaigns_v_version_version_slug_idx" ON "_campaigns_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_campaigns_v_locales_locale_parent_id_unique" ON "_campaigns_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_campaigns_v_rels_order_idx" ON "_campaigns_v_rels" USING btree ("order");
  CREATE INDEX "_campaigns_v_rels_parent_idx" ON "_campaigns_v_rels" USING btree ("parent_id");
  CREATE INDEX "_campaigns_v_rels_path_idx" ON "_campaigns_v_rels" USING btree ("path");
  CREATE INDEX "_campaigns_v_rels_books_id_idx" ON "_campaigns_v_rels" USING btree ("books_id");
  CREATE INDEX "_campaigns_v_rels_products_id_idx" ON "_campaigns_v_rels" USING btree ("products_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_campaigns_fk" FOREIGN KEY ("campaigns_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_campaigns_id_idx" ON "payload_locked_documents_rels" USING btree ("campaigns_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "campaigns_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_features_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_features_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_features_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_video_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_books" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_books_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_products_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_faq_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_cta_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_newsletter" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_blocks_newsletter_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_features_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_features_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_features_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_video_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_books" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_books_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_products_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_faq_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_cta_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_newsletter" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_blocks_newsletter_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campaigns_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "campaigns_blocks_hero" CASCADE;
  DROP TABLE "campaigns_blocks_hero_locales" CASCADE;
  DROP TABLE "campaigns_blocks_text" CASCADE;
  DROP TABLE "campaigns_blocks_text_locales" CASCADE;
  DROP TABLE "campaigns_blocks_features_items" CASCADE;
  DROP TABLE "campaigns_blocks_features_items_locales" CASCADE;
  DROP TABLE "campaigns_blocks_features" CASCADE;
  DROP TABLE "campaigns_blocks_features_locales" CASCADE;
  DROP TABLE "campaigns_blocks_video" CASCADE;
  DROP TABLE "campaigns_blocks_video_locales" CASCADE;
  DROP TABLE "campaigns_blocks_books" CASCADE;
  DROP TABLE "campaigns_blocks_books_locales" CASCADE;
  DROP TABLE "campaigns_blocks_products" CASCADE;
  DROP TABLE "campaigns_blocks_products_locales" CASCADE;
  DROP TABLE "campaigns_blocks_faq_items" CASCADE;
  DROP TABLE "campaigns_blocks_faq_items_locales" CASCADE;
  DROP TABLE "campaigns_blocks_faq" CASCADE;
  DROP TABLE "campaigns_blocks_faq_locales" CASCADE;
  DROP TABLE "campaigns_blocks_cta" CASCADE;
  DROP TABLE "campaigns_blocks_cta_locales" CASCADE;
  DROP TABLE "campaigns_blocks_newsletter" CASCADE;
  DROP TABLE "campaigns_blocks_newsletter_locales" CASCADE;
  DROP TABLE "campaigns" CASCADE;
  DROP TABLE "campaigns_locales" CASCADE;
  DROP TABLE "campaigns_rels" CASCADE;
  DROP TABLE "_campaigns_v_blocks_hero" CASCADE;
  DROP TABLE "_campaigns_v_blocks_hero_locales" CASCADE;
  DROP TABLE "_campaigns_v_blocks_text" CASCADE;
  DROP TABLE "_campaigns_v_blocks_text_locales" CASCADE;
  DROP TABLE "_campaigns_v_blocks_features_items" CASCADE;
  DROP TABLE "_campaigns_v_blocks_features_items_locales" CASCADE;
  DROP TABLE "_campaigns_v_blocks_features" CASCADE;
  DROP TABLE "_campaigns_v_blocks_features_locales" CASCADE;
  DROP TABLE "_campaigns_v_blocks_video" CASCADE;
  DROP TABLE "_campaigns_v_blocks_video_locales" CASCADE;
  DROP TABLE "_campaigns_v_blocks_books" CASCADE;
  DROP TABLE "_campaigns_v_blocks_books_locales" CASCADE;
  DROP TABLE "_campaigns_v_blocks_products" CASCADE;
  DROP TABLE "_campaigns_v_blocks_products_locales" CASCADE;
  DROP TABLE "_campaigns_v_blocks_faq_items" CASCADE;
  DROP TABLE "_campaigns_v_blocks_faq_items_locales" CASCADE;
  DROP TABLE "_campaigns_v_blocks_faq" CASCADE;
  DROP TABLE "_campaigns_v_blocks_faq_locales" CASCADE;
  DROP TABLE "_campaigns_v_blocks_cta" CASCADE;
  DROP TABLE "_campaigns_v_blocks_cta_locales" CASCADE;
  DROP TABLE "_campaigns_v_blocks_newsletter" CASCADE;
  DROP TABLE "_campaigns_v_blocks_newsletter_locales" CASCADE;
  DROP TABLE "_campaigns_v" CASCADE;
  DROP TABLE "_campaigns_v_locales" CASCADE;
  DROP TABLE "_campaigns_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_campaigns_fk";
  
  DROP INDEX "payload_locked_documents_rels_campaigns_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "campaigns_id";
  DROP TYPE "public"."enum_campaigns_blocks_text_image_position";
  DROP TYPE "public"."enum_campaigns_status";
  DROP TYPE "public"."enum__campaigns_v_blocks_text_image_position";
  DROP TYPE "public"."enum__campaigns_v_version_status";
  DROP TYPE "public"."enum__campaigns_v_published_locale";`)
}
