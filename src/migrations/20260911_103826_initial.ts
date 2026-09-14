import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'fr', 'de');
  CREATE TYPE "public"."enum_expertise_areas_icon" AS ENUM('chart', 'magnifier', 'growth', 'plan', 'spark', 'coins', 'building', 'people');
  CREATE TYPE "public"."enum_expertise_areas_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__expertise_areas_v_version_icon" AS ENUM('chart', 'magnifier', 'growth', 'plan', 'spark', 'coins', 'building', 'people');
  CREATE TYPE "public"."enum__expertise_areas_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__expertise_areas_v_published_locale" AS ENUM('en', 'fr', 'de');
  CREATE TYPE "public"."enum_experiences_type" AS ENUM('assignment', 'project');
  CREATE TYPE "public"."enum_experiences_region" AS ENUM('europe', 'africa', 'international');
  CREATE TYPE "public"."enum_experiences_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__experiences_v_version_type" AS ENUM('assignment', 'project');
  CREATE TYPE "public"."enum__experiences_v_version_region" AS ENUM('europe', 'africa', 'international');
  CREATE TYPE "public"."enum__experiences_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__experiences_v_published_locale" AS ENUM('en', 'fr', 'de');
  CREATE TYPE "public"."enum_insights_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__insights_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__insights_v_published_locale" AS ENUM('en', 'fr', 'de');
  CREATE TYPE "public"."enum_books_book_language" AS ENUM('en', 'fr', 'de');
  CREATE TYPE "public"."enum_books_format" AS ENUM('paperback', 'hardcover', 'ebook', 'audiobook');
  CREATE TYPE "public"."enum_books_currency" AS ENUM('EUR', 'USD', 'XAF');
  CREATE TYPE "public"."enum_books_availability" AS ENUM('available', 'preorder', 'comingSoon', 'outOfStock');
  CREATE TYPE "public"."enum_books_sale_type" AS ENUM('external', 'direct', 'none');
  CREATE TYPE "public"."enum_books_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__books_v_version_book_language" AS ENUM('en', 'fr', 'de');
  CREATE TYPE "public"."enum__books_v_version_format" AS ENUM('paperback', 'hardcover', 'ebook', 'audiobook');
  CREATE TYPE "public"."enum__books_v_version_currency" AS ENUM('EUR', 'USD', 'XAF');
  CREATE TYPE "public"."enum__books_v_version_availability" AS ENUM('available', 'preorder', 'comingSoon', 'outOfStock');
  CREATE TYPE "public"."enum__books_v_version_sale_type" AS ENUM('external', 'direct', 'none');
  CREATE TYPE "public"."enum__books_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__books_v_published_locale" AS ENUM('en', 'fr', 'de');
  CREATE TYPE "public"."enum_businesses_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__businesses_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__businesses_v_published_locale" AS ENUM('en', 'fr', 'de');
  CREATE TYPE "public"."enum_credentials_kind" AS ENUM('education', 'credential');
  CREATE TYPE "public"."enum_credentials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__credentials_v_version_kind" AS ENUM('education', 'credential');
  CREATE TYPE "public"."enum__credentials_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__credentials_v_published_locale" AS ENUM('en', 'fr', 'de');
  CREATE TYPE "public"."enum_legal_pages_type" AS ENUM('imprint', 'privacy', 'cookies', 'terms', 'returns');
  CREATE TYPE "public"."enum_legal_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__legal_pages_v_version_type" AS ENUM('imprint', 'privacy', 'cookies', 'terms', 'returns');
  CREATE TYPE "public"."enum__legal_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__legal_pages_v_published_locale" AS ENUM('en', 'fr', 'de');
  CREATE TYPE "public"."enum_documents_kind" AS ENUM('expert-profile', 'cv', 'book-extract', 'other');
  CREATE TYPE "public"."enum_contact_submissions_request_type" AS ENUM('consulting', 'dueDiligence', 'advisory', 'projectManagement', 'smeProgramme', 'training', 'speaking', 'partnership', 'other');
  CREATE TYPE "public"."enum_contact_submissions_status" AS ENUM('new', 'inProgress', 'answered', 'archived');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_site_settings_social_platform" AS ENUM('linkedin', 'x', 'facebook', 'youtube', 'instagram');
  CREATE TYPE "public"."enum_appearance_palette" AS ENUM('signature', 'ivory', 'anthracite', 'petrol', 'forest', 'burgundy', 'custom');
  CREATE TYPE "public"."enum_appearance_heading_font" AS ENUM('source-serif', 'playfair', 'inter');
  CREATE TYPE "public"."enum_appearance_hero_style" AS ENUM('halo', 'plain', 'image');
  CREATE TYPE "public"."enum_appearance_hero_intensity" AS ENUM('subtle', 'visible');
  CREATE TABLE "expertise_areas_challenges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "expertise_areas_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "expertise_areas_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "expertise_areas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum_expertise_areas_icon" DEFAULT 'chart',
  	"featured_on_home" boolean DEFAULT true,
  	"order" numeric DEFAULT 100,
  	"is_placeholder" boolean DEFAULT false,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_expertise_areas_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "expertise_areas_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"summary" varchar,
  	"intro" jsonb,
  	"approach" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_expertise_areas_v_version_challenges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertise_areas_v_version_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertise_areas_v_version_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertise_areas_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_icon" "enum__expertise_areas_v_version_icon" DEFAULT 'chart',
  	"version_featured_on_home" boolean DEFAULT true,
  	"version_order" numeric DEFAULT 100,
  	"version_is_placeholder" boolean DEFAULT false,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__expertise_areas_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__expertise_areas_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_expertise_areas_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_summary" varchar,
  	"version_intro" jsonb,
  	"version_approach" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "experiences_countries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "experiences_countries_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "experiences_responsibilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "experiences_results" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "experiences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_experiences_type" DEFAULT 'assignment',
  	"organisation" varchar,
  	"region" "enum_experiences_region",
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 100,
  	"is_placeholder" boolean DEFAULT false,
  	"results_validated" boolean DEFAULT false,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_experiences_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "experiences_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"role" varchar,
  	"sector" varchar,
  	"summary" varchar,
  	"context" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "experiences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"expertise_areas_id" integer,
  	"insights_id" integer
  );
  
  CREATE TABLE "_experiences_v_version_countries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experiences_v_version_countries_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_experiences_v_version_responsibilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experiences_v_version_results" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experiences_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_type" "enum__experiences_v_version_type" DEFAULT 'assignment',
  	"version_organisation" varchar,
  	"version_region" "enum__experiences_v_version_region",
  	"version_start_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 100,
  	"version_is_placeholder" boolean DEFAULT false,
  	"version_results_validated" boolean DEFAULT false,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__experiences_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__experiences_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_experiences_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_role" varchar,
  	"version_sector" varchar,
  	"version_summary" varchar,
  	"version_context" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_experiences_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"expertise_areas_id" integer,
  	"insights_id" integer
  );
  
  CREATE TABLE "insights" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cover_image_id" integer,
  	"category_id" integer,
  	"author" varchar DEFAULT 'Romial Kenmogne',
  	"published_at" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"reading_time" numeric,
  	"is_placeholder" boolean DEFAULT false,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_insights_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "insights_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"content" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "insights_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"expertise_areas_id" integer,
  	"insights_id" integer,
  	"books_id" integer
  );
  
  CREATE TABLE "_insights_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_cover_image_id" integer,
  	"version_category_id" integer,
  	"version_author" varchar DEFAULT 'Romial Kenmogne',
  	"version_published_at" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_reading_time" numeric,
  	"version_is_placeholder" boolean DEFAULT false,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__insights_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__insights_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_insights_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_insights_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"expertise_areas_id" integer,
  	"insights_id" integer,
  	"books_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "books_audience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "books_book_language" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_books_book_language",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "books_format" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_books_format",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "books_purchase_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "books_purchase_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "books" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"author" varchar DEFAULT 'Romial Kenmogne',
  	"cover_id" integer,
  	"isbn" varchar,
  	"publisher" varchar,
  	"publication_date" timestamp(3) with time zone,
  	"pages" numeric,
  	"price" numeric,
  	"currency" "enum_books_currency" DEFAULT 'EUR',
  	"availability" "enum_books_availability" DEFAULT 'comingSoon',
  	"sale_type" "enum_books_sale_type" DEFAULT 'external',
  	"preview_pdf_id" integer,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 100,
  	"is_placeholder" boolean DEFAULT false,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_books_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "books_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"subtitle" varchar,
  	"summary" varchar,
  	"description" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "books_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"books_id" integer
  );
  
  CREATE TABLE "_books_v_version_audience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_books_v_version_book_language" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__books_v_version_book_language",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_books_v_version_format" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__books_v_version_format",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_books_v_version_purchase_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_books_v_version_purchase_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_books_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_author" varchar DEFAULT 'Romial Kenmogne',
  	"version_cover_id" integer,
  	"version_isbn" varchar,
  	"version_publisher" varchar,
  	"version_publication_date" timestamp(3) with time zone,
  	"version_pages" numeric,
  	"version_price" numeric,
  	"version_currency" "enum__books_v_version_currency" DEFAULT 'EUR',
  	"version_availability" "enum__books_v_version_availability" DEFAULT 'comingSoon',
  	"version_sale_type" "enum__books_v_version_sale_type" DEFAULT 'external',
  	"version_preview_pdf_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 100,
  	"version_is_placeholder" boolean DEFAULT false,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__books_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__books_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_books_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_subtitle" varchar,
  	"version_summary" varchar,
  	"version_description" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_books_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"books_id" integer
  );
  
  CREATE TABLE "businesses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"website" varchar,
  	"contact_email" varchar,
  	"logo_id" integer,
  	"active" boolean DEFAULT true,
  	"order" numeric DEFAULT 100,
  	"is_placeholder" boolean DEFAULT false,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_businesses_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "businesses_locales" (
  	"slug" varchar,
  	"tagline" varchar,
  	"description" varchar,
  	"value_proposition" varchar,
  	"field" varchar,
  	"audience" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_businesses_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_website" varchar,
  	"version_contact_email" varchar,
  	"version_logo_id" integer,
  	"version_active" boolean DEFAULT true,
  	"version_order" numeric DEFAULT 100,
  	"version_is_placeholder" boolean DEFAULT false,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__businesses_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__businesses_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_businesses_v_locales" (
  	"version_slug" varchar,
  	"version_tagline" varchar,
  	"version_description" varchar,
  	"version_value_proposition" varchar,
  	"version_field" varchar,
  	"version_audience" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "credentials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"institution" varchar,
  	"kind" "enum_credentials_kind" DEFAULT 'education',
  	"year" varchar,
  	"location" varchar,
  	"order" numeric DEFAULT 100,
  	"is_placeholder" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_credentials_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "credentials_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_credentials_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_institution" varchar,
  	"version_kind" "enum__credentials_v_version_kind" DEFAULT 'education',
  	"version_year" varchar,
  	"version_location" varchar,
  	"version_order" numeric DEFAULT 100,
  	"version_is_placeholder" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__credentials_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__credentials_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_credentials_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "legal_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_legal_pages_type",
  	"needs_legal_review" boolean DEFAULT true,
  	"last_updated" timestamp(3) with time zone,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_legal_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "legal_pages_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"content" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_legal_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_type" "enum__legal_pages_v_version_type",
  	"version_needs_legal_review" boolean DEFAULT true,
  	"version_last_updated" timestamp(3) with time zone,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__legal_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__legal_pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_legal_pages_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_content" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
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
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_portrait_url" varchar,
  	"sizes_portrait_width" numeric,
  	"sizes_portrait_height" numeric,
  	"sizes_portrait_mime_type" varchar,
  	"sizes_portrait_filesize" numeric,
  	"sizes_portrait_filename" varchar,
  	"sizes_wide_url" varchar,
  	"sizes_wide_width" numeric,
  	"sizes_wide_height" numeric,
  	"sizes_wide_mime_type" varchar,
  	"sizes_wide_filesize" numeric,
  	"sizes_wide_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar,
  	"sizes_book_url" varchar,
  	"sizes_book_width" numeric,
  	"sizes_book_height" numeric,
  	"sizes_book_mime_type" varchar,
  	"sizes_book_filesize" numeric,
  	"sizes_book_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_documents_kind" DEFAULT 'other' NOT NULL,
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
  
  CREATE TABLE "documents_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"organisation" varchar,
  	"email" varchar NOT NULL,
  	"country" varchar NOT NULL,
  	"request_type" "enum_contact_submissions_request_type" NOT NULL,
  	"subject" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"locale" varchar,
  	"status" "enum_contact_submissions_status" DEFAULT 'new',
  	"email_delivered" boolean DEFAULT false,
  	"consent_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"expertise_areas_id" integer,
  	"experiences_id" integer,
  	"insights_id" integer,
  	"categories_id" integer,
  	"books_id" integer,
  	"businesses_id" integer,
  	"credentials_id" integer,
  	"legal_pages_id" integer,
  	"media_id" integer,
  	"documents_id" integer,
  	"contact_submissions_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_site_settings_social_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar DEFAULT 'Romial Kenmogne' NOT NULL,
  	"signature" varchar DEFAULT 'Understand Money. Build Businesses. Invest. Create Wealth.' NOT NULL,
  	"logo_id" integer,
  	"expert_profile_id" integer,
  	"cv_document_id" integer,
  	"credit_name" varchar DEFAULT 'Nana-Consulting',
  	"credit_url" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"notification_email" varchar,
  	"default_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"headline" varchar NOT NULL,
  	"address" varchar,
  	"spoken_languages" varchar,
  	"default_seo_title" varchar,
  	"default_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "appearance" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"palette" "enum_appearance_palette" DEFAULT 'signature' NOT NULL,
  	"light_primary" varchar,
  	"light_accent" varchar,
  	"light_text_secondary" varchar,
  	"light_background" varchar,
  	"light_background_subtle" varchar,
  	"dark_background" varchar,
  	"dark_background_subtle" varchar,
  	"dark_accent" varchar,
  	"heading_font" "enum_appearance_heading_font" DEFAULT 'source-serif' NOT NULL,
  	"hero_style" "enum_appearance_hero_style" DEFAULT 'halo' NOT NULL,
  	"hero_image_id" integer,
  	"hero_intensity" "enum_appearance_hero_intensity" DEFAULT 'subtle',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_hero_key_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_portrait_id" integer,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_locales" (
  	"hero_eyebrow" varchar,
  	"hero_value_proposition" varchar,
  	"expertise_intro" varchar,
  	"experience_intro" varchar,
  	"ecosystem_intro" varchar,
  	"final_cta_title" varchar,
  	"final_cta_body" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_home_page_v_version_hero_key_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_portrait_id" integer,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_home_page_v_locales" (
  	"version_hero_eyebrow" varchar,
  	"version_hero_value_proposition" varchar,
  	"version_expertise_intro" varchar,
  	"version_experience_intro" varchar,
  	"version_ecosystem_intro" varchar,
  	"version_final_cta_title" varchar,
  	"version_final_cta_body" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "about_page_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "about_page_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "about_page_languages_locales" (
  	"language" varchar NOT NULL,
  	"level" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_page_regions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "about_page_regions_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"portrait_id" integer,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_locales" (
  	"lead" varchar,
  	"biography" jsonb,
  	"career" jsonb,
  	"vision" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_about_page_v_version_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_about_page_v_version_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_about_page_v_version_languages_locales" (
  	"language" varchar NOT NULL,
  	"level" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_about_page_v_version_regions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_about_page_v_version_regions_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_about_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_portrait_id" integer,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_about_page_v_locales" (
  	"version_lead" varchar,
  	"version_biography" jsonb,
  	"version_career" jsonb,
  	"version_vision" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "expertise_areas_challenges" ADD CONSTRAINT "expertise_areas_challenges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_areas_services" ADD CONSTRAINT "expertise_areas_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_areas_audiences" ADD CONSTRAINT "expertise_areas_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_areas" ADD CONSTRAINT "expertise_areas_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_areas_locales" ADD CONSTRAINT "expertise_areas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_areas_v_version_challenges" ADD CONSTRAINT "_expertise_areas_v_version_challenges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_areas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_areas_v_version_services" ADD CONSTRAINT "_expertise_areas_v_version_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_areas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_areas_v_version_audiences" ADD CONSTRAINT "_expertise_areas_v_version_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_areas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_areas_v" ADD CONSTRAINT "_expertise_areas_v_parent_id_expertise_areas_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."expertise_areas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_areas_v" ADD CONSTRAINT "_expertise_areas_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_areas_v_locales" ADD CONSTRAINT "_expertise_areas_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_areas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_countries" ADD CONSTRAINT "experiences_countries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_countries_locales" ADD CONSTRAINT "experiences_countries_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences_countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_responsibilities" ADD CONSTRAINT "experiences_responsibilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_results" ADD CONSTRAINT "experiences_results_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences" ADD CONSTRAINT "experiences_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experiences_locales" ADD CONSTRAINT "experiences_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_rels" ADD CONSTRAINT "experiences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_rels" ADD CONSTRAINT "experiences_rels_expertise_areas_fk" FOREIGN KEY ("expertise_areas_id") REFERENCES "public"."expertise_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_rels" ADD CONSTRAINT "experiences_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_countries" ADD CONSTRAINT "_experiences_v_version_countries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_countries_locales" ADD CONSTRAINT "_experiences_v_version_countries_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v_version_countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_responsibilities" ADD CONSTRAINT "_experiences_v_version_responsibilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_results" ADD CONSTRAINT "_experiences_v_version_results_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v" ADD CONSTRAINT "_experiences_v_parent_id_experiences_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."experiences"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_experiences_v" ADD CONSTRAINT "_experiences_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_experiences_v_locales" ADD CONSTRAINT "_experiences_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_rels" ADD CONSTRAINT "_experiences_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_rels" ADD CONSTRAINT "_experiences_v_rels_expertise_areas_fk" FOREIGN KEY ("expertise_areas_id") REFERENCES "public"."expertise_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_rels" ADD CONSTRAINT "_experiences_v_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights" ADD CONSTRAINT "insights_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights" ADD CONSTRAINT "insights_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights" ADD CONSTRAINT "insights_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights_locales" ADD CONSTRAINT "insights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_rels" ADD CONSTRAINT "insights_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_rels" ADD CONSTRAINT "insights_rels_expertise_areas_fk" FOREIGN KEY ("expertise_areas_id") REFERENCES "public"."expertise_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_rels" ADD CONSTRAINT "insights_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_rels" ADD CONSTRAINT "insights_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_parent_id_insights_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."insights"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v_locales" ADD CONSTRAINT "_insights_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_insights_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_rels" ADD CONSTRAINT "_insights_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_insights_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_rels" ADD CONSTRAINT "_insights_v_rels_expertise_areas_fk" FOREIGN KEY ("expertise_areas_id") REFERENCES "public"."expertise_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_rels" ADD CONSTRAINT "_insights_v_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_rels" ADD CONSTRAINT "_insights_v_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_audience" ADD CONSTRAINT "books_audience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_book_language" ADD CONSTRAINT "books_book_language_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_format" ADD CONSTRAINT "books_format_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_purchase_links" ADD CONSTRAINT "books_purchase_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_purchase_links_locales" ADD CONSTRAINT "books_purchase_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."books_purchase_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_preview_pdf_id_documents_id_fk" FOREIGN KEY ("preview_pdf_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "books_locales" ADD CONSTRAINT "books_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_rels" ADD CONSTRAINT "books_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_rels" ADD CONSTRAINT "books_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_books_v_version_audience" ADD CONSTRAINT "_books_v_version_audience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_books_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_books_v_version_book_language" ADD CONSTRAINT "_books_v_version_book_language_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_books_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_books_v_version_format" ADD CONSTRAINT "_books_v_version_format_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_books_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_books_v_version_purchase_links" ADD CONSTRAINT "_books_v_version_purchase_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_books_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_books_v_version_purchase_links_locales" ADD CONSTRAINT "_books_v_version_purchase_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_books_v_version_purchase_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_books_v" ADD CONSTRAINT "_books_v_parent_id_books_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_books_v" ADD CONSTRAINT "_books_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_books_v" ADD CONSTRAINT "_books_v_version_preview_pdf_id_documents_id_fk" FOREIGN KEY ("version_preview_pdf_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_books_v" ADD CONSTRAINT "_books_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_books_v_locales" ADD CONSTRAINT "_books_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_books_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_books_v_rels" ADD CONSTRAINT "_books_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_books_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_books_v_rels" ADD CONSTRAINT "_books_v_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "businesses" ADD CONSTRAINT "businesses_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "businesses" ADD CONSTRAINT "businesses_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "businesses_locales" ADD CONSTRAINT "businesses_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_businesses_v" ADD CONSTRAINT "_businesses_v_parent_id_businesses_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_businesses_v" ADD CONSTRAINT "_businesses_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_businesses_v" ADD CONSTRAINT "_businesses_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_businesses_v_locales" ADD CONSTRAINT "_businesses_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_businesses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "credentials_locales" ADD CONSTRAINT "credentials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."credentials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_credentials_v" ADD CONSTRAINT "_credentials_v_parent_id_credentials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."credentials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_credentials_v_locales" ADD CONSTRAINT "_credentials_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_credentials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legal_pages" ADD CONSTRAINT "legal_pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "legal_pages_locales" ADD CONSTRAINT "legal_pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_legal_pages_v" ADD CONSTRAINT "_legal_pages_v_parent_id_legal_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."legal_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_legal_pages_v" ADD CONSTRAINT "_legal_pages_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_legal_pages_v_locales" ADD CONSTRAINT "_legal_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_legal_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_locales" ADD CONSTRAINT "documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_expertise_areas_fk" FOREIGN KEY ("expertise_areas_id") REFERENCES "public"."expertise_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_experiences_fk" FOREIGN KEY ("experiences_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_businesses_fk" FOREIGN KEY ("businesses_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_credentials_fk" FOREIGN KEY ("credentials_id") REFERENCES "public"."credentials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_legal_pages_fk" FOREIGN KEY ("legal_pages_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk" FOREIGN KEY ("contact_submissions_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social" ADD CONSTRAINT "site_settings_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_expert_profile_id_documents_id_fk" FOREIGN KEY ("expert_profile_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_cv_document_id_documents_id_fk" FOREIGN KEY ("cv_document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "appearance" ADD CONSTRAINT "appearance_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_hero_key_points" ADD CONSTRAINT "home_page_hero_key_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_portrait_id_media_id_fk" FOREIGN KEY ("hero_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_locales" ADD CONSTRAINT "home_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_hero_key_points" ADD CONSTRAINT "_home_page_v_version_hero_key_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_hero_portrait_id_media_id_fk" FOREIGN KEY ("version_hero_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v_locales" ADD CONSTRAINT "_home_page_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_values" ADD CONSTRAINT "about_page_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_languages" ADD CONSTRAINT "about_page_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_languages_locales" ADD CONSTRAINT "about_page_languages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page_languages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_regions" ADD CONSTRAINT "about_page_regions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_regions_locales" ADD CONSTRAINT "about_page_regions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page_regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page" ADD CONSTRAINT "about_page_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page" ADD CONSTRAINT "about_page_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page_locales" ADD CONSTRAINT "about_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_page_v_version_values" ADD CONSTRAINT "_about_page_v_version_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_page_v_version_languages" ADD CONSTRAINT "_about_page_v_version_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_page_v_version_languages_locales" ADD CONSTRAINT "_about_page_v_version_languages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_page_v_version_languages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_page_v_version_regions" ADD CONSTRAINT "_about_page_v_version_regions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_page_v_version_regions_locales" ADD CONSTRAINT "_about_page_v_version_regions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_page_v_version_regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_page_v" ADD CONSTRAINT "_about_page_v_version_portrait_id_media_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_page_v" ADD CONSTRAINT "_about_page_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_page_v_locales" ADD CONSTRAINT "_about_page_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_page_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "expertise_areas_challenges_order_idx" ON "expertise_areas_challenges" USING btree ("_order");
  CREATE INDEX "expertise_areas_challenges_parent_id_idx" ON "expertise_areas_challenges" USING btree ("_parent_id");
  CREATE INDEX "expertise_areas_challenges_locale_idx" ON "expertise_areas_challenges" USING btree ("_locale");
  CREATE INDEX "expertise_areas_services_order_idx" ON "expertise_areas_services" USING btree ("_order");
  CREATE INDEX "expertise_areas_services_parent_id_idx" ON "expertise_areas_services" USING btree ("_parent_id");
  CREATE INDEX "expertise_areas_services_locale_idx" ON "expertise_areas_services" USING btree ("_locale");
  CREATE INDEX "expertise_areas_audiences_order_idx" ON "expertise_areas_audiences" USING btree ("_order");
  CREATE INDEX "expertise_areas_audiences_parent_id_idx" ON "expertise_areas_audiences" USING btree ("_parent_id");
  CREATE INDEX "expertise_areas_audiences_locale_idx" ON "expertise_areas_audiences" USING btree ("_locale");
  CREATE INDEX "expertise_areas_seo_seo_image_idx" ON "expertise_areas" USING btree ("seo_image_id");
  CREATE INDEX "expertise_areas_updated_at_idx" ON "expertise_areas" USING btree ("updated_at");
  CREATE INDEX "expertise_areas_created_at_idx" ON "expertise_areas" USING btree ("created_at");
  CREATE INDEX "expertise_areas__status_idx" ON "expertise_areas" USING btree ("_status");
  CREATE INDEX "expertise_areas_slug_idx" ON "expertise_areas_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "expertise_areas_locales_locale_parent_id_unique" ON "expertise_areas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_expertise_areas_v_version_challenges_order_idx" ON "_expertise_areas_v_version_challenges" USING btree ("_order");
  CREATE INDEX "_expertise_areas_v_version_challenges_parent_id_idx" ON "_expertise_areas_v_version_challenges" USING btree ("_parent_id");
  CREATE INDEX "_expertise_areas_v_version_challenges_locale_idx" ON "_expertise_areas_v_version_challenges" USING btree ("_locale");
  CREATE INDEX "_expertise_areas_v_version_services_order_idx" ON "_expertise_areas_v_version_services" USING btree ("_order");
  CREATE INDEX "_expertise_areas_v_version_services_parent_id_idx" ON "_expertise_areas_v_version_services" USING btree ("_parent_id");
  CREATE INDEX "_expertise_areas_v_version_services_locale_idx" ON "_expertise_areas_v_version_services" USING btree ("_locale");
  CREATE INDEX "_expertise_areas_v_version_audiences_order_idx" ON "_expertise_areas_v_version_audiences" USING btree ("_order");
  CREATE INDEX "_expertise_areas_v_version_audiences_parent_id_idx" ON "_expertise_areas_v_version_audiences" USING btree ("_parent_id");
  CREATE INDEX "_expertise_areas_v_version_audiences_locale_idx" ON "_expertise_areas_v_version_audiences" USING btree ("_locale");
  CREATE INDEX "_expertise_areas_v_parent_idx" ON "_expertise_areas_v" USING btree ("parent_id");
  CREATE INDEX "_expertise_areas_v_version_seo_version_seo_image_idx" ON "_expertise_areas_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_expertise_areas_v_version_version_updated_at_idx" ON "_expertise_areas_v" USING btree ("version_updated_at");
  CREATE INDEX "_expertise_areas_v_version_version_created_at_idx" ON "_expertise_areas_v" USING btree ("version_created_at");
  CREATE INDEX "_expertise_areas_v_version_version__status_idx" ON "_expertise_areas_v" USING btree ("version__status");
  CREATE INDEX "_expertise_areas_v_created_at_idx" ON "_expertise_areas_v" USING btree ("created_at");
  CREATE INDEX "_expertise_areas_v_updated_at_idx" ON "_expertise_areas_v" USING btree ("updated_at");
  CREATE INDEX "_expertise_areas_v_snapshot_idx" ON "_expertise_areas_v" USING btree ("snapshot");
  CREATE INDEX "_expertise_areas_v_published_locale_idx" ON "_expertise_areas_v" USING btree ("published_locale");
  CREATE INDEX "_expertise_areas_v_latest_idx" ON "_expertise_areas_v" USING btree ("latest");
  CREATE INDEX "_expertise_areas_v_version_version_slug_idx" ON "_expertise_areas_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_expertise_areas_v_locales_locale_parent_id_unique" ON "_expertise_areas_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "experiences_countries_order_idx" ON "experiences_countries" USING btree ("_order");
  CREATE INDEX "experiences_countries_parent_id_idx" ON "experiences_countries" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "experiences_countries_locales_locale_parent_id_unique" ON "experiences_countries_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "experiences_responsibilities_order_idx" ON "experiences_responsibilities" USING btree ("_order");
  CREATE INDEX "experiences_responsibilities_parent_id_idx" ON "experiences_responsibilities" USING btree ("_parent_id");
  CREATE INDEX "experiences_responsibilities_locale_idx" ON "experiences_responsibilities" USING btree ("_locale");
  CREATE INDEX "experiences_results_order_idx" ON "experiences_results" USING btree ("_order");
  CREATE INDEX "experiences_results_parent_id_idx" ON "experiences_results" USING btree ("_parent_id");
  CREATE INDEX "experiences_results_locale_idx" ON "experiences_results" USING btree ("_locale");
  CREATE INDEX "experiences_seo_seo_image_idx" ON "experiences" USING btree ("seo_image_id");
  CREATE INDEX "experiences_updated_at_idx" ON "experiences" USING btree ("updated_at");
  CREATE INDEX "experiences_created_at_idx" ON "experiences" USING btree ("created_at");
  CREATE INDEX "experiences__status_idx" ON "experiences" USING btree ("_status");
  CREATE INDEX "experiences_slug_idx" ON "experiences_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "experiences_locales_locale_parent_id_unique" ON "experiences_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "experiences_rels_order_idx" ON "experiences_rels" USING btree ("order");
  CREATE INDEX "experiences_rels_parent_idx" ON "experiences_rels" USING btree ("parent_id");
  CREATE INDEX "experiences_rels_path_idx" ON "experiences_rels" USING btree ("path");
  CREATE INDEX "experiences_rels_expertise_areas_id_idx" ON "experiences_rels" USING btree ("expertise_areas_id");
  CREATE INDEX "experiences_rels_insights_id_idx" ON "experiences_rels" USING btree ("insights_id");
  CREATE INDEX "_experiences_v_version_countries_order_idx" ON "_experiences_v_version_countries" USING btree ("_order");
  CREATE INDEX "_experiences_v_version_countries_parent_id_idx" ON "_experiences_v_version_countries" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_experiences_v_version_countries_locales_locale_parent_id_un" ON "_experiences_v_version_countries_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_experiences_v_version_responsibilities_order_idx" ON "_experiences_v_version_responsibilities" USING btree ("_order");
  CREATE INDEX "_experiences_v_version_responsibilities_parent_id_idx" ON "_experiences_v_version_responsibilities" USING btree ("_parent_id");
  CREATE INDEX "_experiences_v_version_responsibilities_locale_idx" ON "_experiences_v_version_responsibilities" USING btree ("_locale");
  CREATE INDEX "_experiences_v_version_results_order_idx" ON "_experiences_v_version_results" USING btree ("_order");
  CREATE INDEX "_experiences_v_version_results_parent_id_idx" ON "_experiences_v_version_results" USING btree ("_parent_id");
  CREATE INDEX "_experiences_v_version_results_locale_idx" ON "_experiences_v_version_results" USING btree ("_locale");
  CREATE INDEX "_experiences_v_parent_idx" ON "_experiences_v" USING btree ("parent_id");
  CREATE INDEX "_experiences_v_version_seo_version_seo_image_idx" ON "_experiences_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_experiences_v_version_version_updated_at_idx" ON "_experiences_v" USING btree ("version_updated_at");
  CREATE INDEX "_experiences_v_version_version_created_at_idx" ON "_experiences_v" USING btree ("version_created_at");
  CREATE INDEX "_experiences_v_version_version__status_idx" ON "_experiences_v" USING btree ("version__status");
  CREATE INDEX "_experiences_v_created_at_idx" ON "_experiences_v" USING btree ("created_at");
  CREATE INDEX "_experiences_v_updated_at_idx" ON "_experiences_v" USING btree ("updated_at");
  CREATE INDEX "_experiences_v_snapshot_idx" ON "_experiences_v" USING btree ("snapshot");
  CREATE INDEX "_experiences_v_published_locale_idx" ON "_experiences_v" USING btree ("published_locale");
  CREATE INDEX "_experiences_v_latest_idx" ON "_experiences_v" USING btree ("latest");
  CREATE INDEX "_experiences_v_version_version_slug_idx" ON "_experiences_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_experiences_v_locales_locale_parent_id_unique" ON "_experiences_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_experiences_v_rels_order_idx" ON "_experiences_v_rels" USING btree ("order");
  CREATE INDEX "_experiences_v_rels_parent_idx" ON "_experiences_v_rels" USING btree ("parent_id");
  CREATE INDEX "_experiences_v_rels_path_idx" ON "_experiences_v_rels" USING btree ("path");
  CREATE INDEX "_experiences_v_rels_expertise_areas_id_idx" ON "_experiences_v_rels" USING btree ("expertise_areas_id");
  CREATE INDEX "_experiences_v_rels_insights_id_idx" ON "_experiences_v_rels" USING btree ("insights_id");
  CREATE INDEX "insights_cover_image_idx" ON "insights" USING btree ("cover_image_id");
  CREATE INDEX "insights_category_idx" ON "insights" USING btree ("category_id");
  CREATE INDEX "insights_seo_seo_image_idx" ON "insights" USING btree ("seo_image_id");
  CREATE INDEX "insights_updated_at_idx" ON "insights" USING btree ("updated_at");
  CREATE INDEX "insights_created_at_idx" ON "insights" USING btree ("created_at");
  CREATE INDEX "insights__status_idx" ON "insights" USING btree ("_status");
  CREATE INDEX "insights_slug_idx" ON "insights_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "insights_locales_locale_parent_id_unique" ON "insights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "insights_rels_order_idx" ON "insights_rels" USING btree ("order");
  CREATE INDEX "insights_rels_parent_idx" ON "insights_rels" USING btree ("parent_id");
  CREATE INDEX "insights_rels_path_idx" ON "insights_rels" USING btree ("path");
  CREATE INDEX "insights_rels_expertise_areas_id_idx" ON "insights_rels" USING btree ("expertise_areas_id");
  CREATE INDEX "insights_rels_insights_id_idx" ON "insights_rels" USING btree ("insights_id");
  CREATE INDEX "insights_rels_books_id_idx" ON "insights_rels" USING btree ("books_id");
  CREATE INDEX "_insights_v_parent_idx" ON "_insights_v" USING btree ("parent_id");
  CREATE INDEX "_insights_v_version_version_cover_image_idx" ON "_insights_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_insights_v_version_version_category_idx" ON "_insights_v" USING btree ("version_category_id");
  CREATE INDEX "_insights_v_version_seo_version_seo_image_idx" ON "_insights_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_insights_v_version_version_updated_at_idx" ON "_insights_v" USING btree ("version_updated_at");
  CREATE INDEX "_insights_v_version_version_created_at_idx" ON "_insights_v" USING btree ("version_created_at");
  CREATE INDEX "_insights_v_version_version__status_idx" ON "_insights_v" USING btree ("version__status");
  CREATE INDEX "_insights_v_created_at_idx" ON "_insights_v" USING btree ("created_at");
  CREATE INDEX "_insights_v_updated_at_idx" ON "_insights_v" USING btree ("updated_at");
  CREATE INDEX "_insights_v_snapshot_idx" ON "_insights_v" USING btree ("snapshot");
  CREATE INDEX "_insights_v_published_locale_idx" ON "_insights_v" USING btree ("published_locale");
  CREATE INDEX "_insights_v_latest_idx" ON "_insights_v" USING btree ("latest");
  CREATE INDEX "_insights_v_version_version_slug_idx" ON "_insights_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_insights_v_locales_locale_parent_id_unique" ON "_insights_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_insights_v_rels_order_idx" ON "_insights_v_rels" USING btree ("order");
  CREATE INDEX "_insights_v_rels_parent_idx" ON "_insights_v_rels" USING btree ("parent_id");
  CREATE INDEX "_insights_v_rels_path_idx" ON "_insights_v_rels" USING btree ("path");
  CREATE INDEX "_insights_v_rels_expertise_areas_id_idx" ON "_insights_v_rels" USING btree ("expertise_areas_id");
  CREATE INDEX "_insights_v_rels_insights_id_idx" ON "_insights_v_rels" USING btree ("insights_id");
  CREATE INDEX "_insights_v_rels_books_id_idx" ON "_insights_v_rels" USING btree ("books_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "categories_slug_idx" ON "categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "books_audience_order_idx" ON "books_audience" USING btree ("_order");
  CREATE INDEX "books_audience_parent_id_idx" ON "books_audience" USING btree ("_parent_id");
  CREATE INDEX "books_audience_locale_idx" ON "books_audience" USING btree ("_locale");
  CREATE INDEX "books_book_language_order_idx" ON "books_book_language" USING btree ("order");
  CREATE INDEX "books_book_language_parent_idx" ON "books_book_language" USING btree ("parent_id");
  CREATE INDEX "books_format_order_idx" ON "books_format" USING btree ("order");
  CREATE INDEX "books_format_parent_idx" ON "books_format" USING btree ("parent_id");
  CREATE INDEX "books_purchase_links_order_idx" ON "books_purchase_links" USING btree ("_order");
  CREATE INDEX "books_purchase_links_parent_id_idx" ON "books_purchase_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "books_purchase_links_locales_locale_parent_id_unique" ON "books_purchase_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "books_cover_idx" ON "books" USING btree ("cover_id");
  CREATE INDEX "books_preview_pdf_idx" ON "books" USING btree ("preview_pdf_id");
  CREATE INDEX "books_seo_seo_image_idx" ON "books" USING btree ("seo_image_id");
  CREATE INDEX "books_updated_at_idx" ON "books" USING btree ("updated_at");
  CREATE INDEX "books_created_at_idx" ON "books" USING btree ("created_at");
  CREATE INDEX "books__status_idx" ON "books" USING btree ("_status");
  CREATE INDEX "books_slug_idx" ON "books_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "books_locales_locale_parent_id_unique" ON "books_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "books_rels_order_idx" ON "books_rels" USING btree ("order");
  CREATE INDEX "books_rels_parent_idx" ON "books_rels" USING btree ("parent_id");
  CREATE INDEX "books_rels_path_idx" ON "books_rels" USING btree ("path");
  CREATE INDEX "books_rels_books_id_idx" ON "books_rels" USING btree ("books_id");
  CREATE INDEX "_books_v_version_audience_order_idx" ON "_books_v_version_audience" USING btree ("_order");
  CREATE INDEX "_books_v_version_audience_parent_id_idx" ON "_books_v_version_audience" USING btree ("_parent_id");
  CREATE INDEX "_books_v_version_audience_locale_idx" ON "_books_v_version_audience" USING btree ("_locale");
  CREATE INDEX "_books_v_version_book_language_order_idx" ON "_books_v_version_book_language" USING btree ("order");
  CREATE INDEX "_books_v_version_book_language_parent_idx" ON "_books_v_version_book_language" USING btree ("parent_id");
  CREATE INDEX "_books_v_version_format_order_idx" ON "_books_v_version_format" USING btree ("order");
  CREATE INDEX "_books_v_version_format_parent_idx" ON "_books_v_version_format" USING btree ("parent_id");
  CREATE INDEX "_books_v_version_purchase_links_order_idx" ON "_books_v_version_purchase_links" USING btree ("_order");
  CREATE INDEX "_books_v_version_purchase_links_parent_id_idx" ON "_books_v_version_purchase_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_books_v_version_purchase_links_locales_locale_parent_id_uni" ON "_books_v_version_purchase_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_books_v_parent_idx" ON "_books_v" USING btree ("parent_id");
  CREATE INDEX "_books_v_version_version_cover_idx" ON "_books_v" USING btree ("version_cover_id");
  CREATE INDEX "_books_v_version_version_preview_pdf_idx" ON "_books_v" USING btree ("version_preview_pdf_id");
  CREATE INDEX "_books_v_version_seo_version_seo_image_idx" ON "_books_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_books_v_version_version_updated_at_idx" ON "_books_v" USING btree ("version_updated_at");
  CREATE INDEX "_books_v_version_version_created_at_idx" ON "_books_v" USING btree ("version_created_at");
  CREATE INDEX "_books_v_version_version__status_idx" ON "_books_v" USING btree ("version__status");
  CREATE INDEX "_books_v_created_at_idx" ON "_books_v" USING btree ("created_at");
  CREATE INDEX "_books_v_updated_at_idx" ON "_books_v" USING btree ("updated_at");
  CREATE INDEX "_books_v_snapshot_idx" ON "_books_v" USING btree ("snapshot");
  CREATE INDEX "_books_v_published_locale_idx" ON "_books_v" USING btree ("published_locale");
  CREATE INDEX "_books_v_latest_idx" ON "_books_v" USING btree ("latest");
  CREATE INDEX "_books_v_version_version_slug_idx" ON "_books_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_books_v_locales_locale_parent_id_unique" ON "_books_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_books_v_rels_order_idx" ON "_books_v_rels" USING btree ("order");
  CREATE INDEX "_books_v_rels_parent_idx" ON "_books_v_rels" USING btree ("parent_id");
  CREATE INDEX "_books_v_rels_path_idx" ON "_books_v_rels" USING btree ("path");
  CREATE INDEX "_books_v_rels_books_id_idx" ON "_books_v_rels" USING btree ("books_id");
  CREATE INDEX "businesses_logo_idx" ON "businesses" USING btree ("logo_id");
  CREATE INDEX "businesses_seo_seo_image_idx" ON "businesses" USING btree ("seo_image_id");
  CREATE INDEX "businesses_updated_at_idx" ON "businesses" USING btree ("updated_at");
  CREATE INDEX "businesses_created_at_idx" ON "businesses" USING btree ("created_at");
  CREATE INDEX "businesses__status_idx" ON "businesses" USING btree ("_status");
  CREATE INDEX "businesses_slug_idx" ON "businesses_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "businesses_locales_locale_parent_id_unique" ON "businesses_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_businesses_v_parent_idx" ON "_businesses_v" USING btree ("parent_id");
  CREATE INDEX "_businesses_v_version_version_logo_idx" ON "_businesses_v" USING btree ("version_logo_id");
  CREATE INDEX "_businesses_v_version_seo_version_seo_image_idx" ON "_businesses_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_businesses_v_version_version_updated_at_idx" ON "_businesses_v" USING btree ("version_updated_at");
  CREATE INDEX "_businesses_v_version_version_created_at_idx" ON "_businesses_v" USING btree ("version_created_at");
  CREATE INDEX "_businesses_v_version_version__status_idx" ON "_businesses_v" USING btree ("version__status");
  CREATE INDEX "_businesses_v_created_at_idx" ON "_businesses_v" USING btree ("created_at");
  CREATE INDEX "_businesses_v_updated_at_idx" ON "_businesses_v" USING btree ("updated_at");
  CREATE INDEX "_businesses_v_snapshot_idx" ON "_businesses_v" USING btree ("snapshot");
  CREATE INDEX "_businesses_v_published_locale_idx" ON "_businesses_v" USING btree ("published_locale");
  CREATE INDEX "_businesses_v_latest_idx" ON "_businesses_v" USING btree ("latest");
  CREATE INDEX "_businesses_v_version_version_slug_idx" ON "_businesses_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_businesses_v_locales_locale_parent_id_unique" ON "_businesses_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "credentials_updated_at_idx" ON "credentials" USING btree ("updated_at");
  CREATE INDEX "credentials_created_at_idx" ON "credentials" USING btree ("created_at");
  CREATE INDEX "credentials__status_idx" ON "credentials" USING btree ("_status");
  CREATE UNIQUE INDEX "credentials_locales_locale_parent_id_unique" ON "credentials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_credentials_v_parent_idx" ON "_credentials_v" USING btree ("parent_id");
  CREATE INDEX "_credentials_v_version_version_updated_at_idx" ON "_credentials_v" USING btree ("version_updated_at");
  CREATE INDEX "_credentials_v_version_version_created_at_idx" ON "_credentials_v" USING btree ("version_created_at");
  CREATE INDEX "_credentials_v_version_version__status_idx" ON "_credentials_v" USING btree ("version__status");
  CREATE INDEX "_credentials_v_created_at_idx" ON "_credentials_v" USING btree ("created_at");
  CREATE INDEX "_credentials_v_updated_at_idx" ON "_credentials_v" USING btree ("updated_at");
  CREATE INDEX "_credentials_v_snapshot_idx" ON "_credentials_v" USING btree ("snapshot");
  CREATE INDEX "_credentials_v_published_locale_idx" ON "_credentials_v" USING btree ("published_locale");
  CREATE INDEX "_credentials_v_latest_idx" ON "_credentials_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_credentials_v_locales_locale_parent_id_unique" ON "_credentials_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "legal_pages_type_idx" ON "legal_pages" USING btree ("type");
  CREATE INDEX "legal_pages_seo_seo_image_idx" ON "legal_pages" USING btree ("seo_image_id");
  CREATE INDEX "legal_pages_updated_at_idx" ON "legal_pages" USING btree ("updated_at");
  CREATE INDEX "legal_pages_created_at_idx" ON "legal_pages" USING btree ("created_at");
  CREATE INDEX "legal_pages__status_idx" ON "legal_pages" USING btree ("_status");
  CREATE INDEX "legal_pages_slug_idx" ON "legal_pages_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "legal_pages_locales_locale_parent_id_unique" ON "legal_pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_legal_pages_v_parent_idx" ON "_legal_pages_v" USING btree ("parent_id");
  CREATE INDEX "_legal_pages_v_version_version_type_idx" ON "_legal_pages_v" USING btree ("version_type");
  CREATE INDEX "_legal_pages_v_version_seo_version_seo_image_idx" ON "_legal_pages_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_legal_pages_v_version_version_updated_at_idx" ON "_legal_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_legal_pages_v_version_version_created_at_idx" ON "_legal_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_legal_pages_v_version_version__status_idx" ON "_legal_pages_v" USING btree ("version__status");
  CREATE INDEX "_legal_pages_v_created_at_idx" ON "_legal_pages_v" USING btree ("created_at");
  CREATE INDEX "_legal_pages_v_updated_at_idx" ON "_legal_pages_v" USING btree ("updated_at");
  CREATE INDEX "_legal_pages_v_snapshot_idx" ON "_legal_pages_v" USING btree ("snapshot");
  CREATE INDEX "_legal_pages_v_published_locale_idx" ON "_legal_pages_v" USING btree ("published_locale");
  CREATE INDEX "_legal_pages_v_latest_idx" ON "_legal_pages_v" USING btree ("latest");
  CREATE INDEX "_legal_pages_v_version_version_slug_idx" ON "_legal_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_legal_pages_v_locales_locale_parent_id_unique" ON "_legal_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_portrait_sizes_portrait_filename_idx" ON "media" USING btree ("sizes_portrait_filename");
  CREATE INDEX "media_sizes_wide_sizes_wide_filename_idx" ON "media" USING btree ("sizes_wide_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "media_sizes_book_sizes_book_filename_idx" ON "media" USING btree ("sizes_book_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE UNIQUE INDEX "documents_locales_locale_parent_id_unique" ON "documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_submissions_updated_at_idx" ON "contact_submissions" USING btree ("updated_at");
  CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_expertise_areas_id_idx" ON "payload_locked_documents_rels" USING btree ("expertise_areas_id");
  CREATE INDEX "payload_locked_documents_rels_experiences_id_idx" ON "payload_locked_documents_rels" USING btree ("experiences_id");
  CREATE INDEX "payload_locked_documents_rels_insights_id_idx" ON "payload_locked_documents_rels" USING btree ("insights_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_books_id_idx" ON "payload_locked_documents_rels" USING btree ("books_id");
  CREATE INDEX "payload_locked_documents_rels_businesses_id_idx" ON "payload_locked_documents_rels" USING btree ("businesses_id");
  CREATE INDEX "payload_locked_documents_rels_credentials_id_idx" ON "payload_locked_documents_rels" USING btree ("credentials_id");
  CREATE INDEX "payload_locked_documents_rels_legal_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("legal_pages_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_contact_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_social_order_idx" ON "site_settings_social" USING btree ("_order");
  CREATE INDEX "site_settings_social_parent_id_idx" ON "site_settings_social" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_expert_profile_idx" ON "site_settings" USING btree ("expert_profile_id");
  CREATE INDEX "site_settings_cv_document_idx" ON "site_settings" USING btree ("cv_document_id");
  CREATE INDEX "site_settings_default_og_image_idx" ON "site_settings" USING btree ("default_og_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "appearance_hero_hero_image_idx" ON "appearance" USING btree ("hero_image_id");
  CREATE INDEX "home_page_hero_key_points_order_idx" ON "home_page_hero_key_points" USING btree ("_order");
  CREATE INDEX "home_page_hero_key_points_parent_id_idx" ON "home_page_hero_key_points" USING btree ("_parent_id");
  CREATE INDEX "home_page_hero_key_points_locale_idx" ON "home_page_hero_key_points" USING btree ("_locale");
  CREATE INDEX "home_page_hero_portrait_idx" ON "home_page" USING btree ("hero_portrait_id");
  CREATE INDEX "home_page_seo_seo_image_idx" ON "home_page" USING btree ("seo_image_id");
  CREATE UNIQUE INDEX "home_page_locales_locale_parent_id_unique" ON "home_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_home_page_v_version_hero_key_points_order_idx" ON "_home_page_v_version_hero_key_points" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_hero_key_points_parent_id_idx" ON "_home_page_v_version_hero_key_points" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_hero_key_points_locale_idx" ON "_home_page_v_version_hero_key_points" USING btree ("_locale");
  CREATE INDEX "_home_page_v_version_version_hero_portrait_idx" ON "_home_page_v" USING btree ("version_hero_portrait_id");
  CREATE INDEX "_home_page_v_version_seo_version_seo_image_idx" ON "_home_page_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_home_page_v_created_at_idx" ON "_home_page_v" USING btree ("created_at");
  CREATE INDEX "_home_page_v_updated_at_idx" ON "_home_page_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_home_page_v_locales_locale_parent_id_unique" ON "_home_page_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_page_values_order_idx" ON "about_page_values" USING btree ("_order");
  CREATE INDEX "about_page_values_parent_id_idx" ON "about_page_values" USING btree ("_parent_id");
  CREATE INDEX "about_page_values_locale_idx" ON "about_page_values" USING btree ("_locale");
  CREATE INDEX "about_page_languages_order_idx" ON "about_page_languages" USING btree ("_order");
  CREATE INDEX "about_page_languages_parent_id_idx" ON "about_page_languages" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_page_languages_locales_locale_parent_id_unique" ON "about_page_languages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_page_regions_order_idx" ON "about_page_regions" USING btree ("_order");
  CREATE INDEX "about_page_regions_parent_id_idx" ON "about_page_regions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_page_regions_locales_locale_parent_id_unique" ON "about_page_regions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_page_portrait_idx" ON "about_page" USING btree ("portrait_id");
  CREATE INDEX "about_page_seo_seo_image_idx" ON "about_page" USING btree ("seo_image_id");
  CREATE UNIQUE INDEX "about_page_locales_locale_parent_id_unique" ON "about_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_about_page_v_version_values_order_idx" ON "_about_page_v_version_values" USING btree ("_order");
  CREATE INDEX "_about_page_v_version_values_parent_id_idx" ON "_about_page_v_version_values" USING btree ("_parent_id");
  CREATE INDEX "_about_page_v_version_values_locale_idx" ON "_about_page_v_version_values" USING btree ("_locale");
  CREATE INDEX "_about_page_v_version_languages_order_idx" ON "_about_page_v_version_languages" USING btree ("_order");
  CREATE INDEX "_about_page_v_version_languages_parent_id_idx" ON "_about_page_v_version_languages" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_about_page_v_version_languages_locales_locale_parent_id_uni" ON "_about_page_v_version_languages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_about_page_v_version_regions_order_idx" ON "_about_page_v_version_regions" USING btree ("_order");
  CREATE INDEX "_about_page_v_version_regions_parent_id_idx" ON "_about_page_v_version_regions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_about_page_v_version_regions_locales_locale_parent_id_uniqu" ON "_about_page_v_version_regions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_about_page_v_version_version_portrait_idx" ON "_about_page_v" USING btree ("version_portrait_id");
  CREATE INDEX "_about_page_v_version_seo_version_seo_image_idx" ON "_about_page_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_about_page_v_created_at_idx" ON "_about_page_v" USING btree ("created_at");
  CREATE INDEX "_about_page_v_updated_at_idx" ON "_about_page_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_about_page_v_locales_locale_parent_id_unique" ON "_about_page_v_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "expertise_areas_challenges" CASCADE;
  DROP TABLE "expertise_areas_services" CASCADE;
  DROP TABLE "expertise_areas_audiences" CASCADE;
  DROP TABLE "expertise_areas" CASCADE;
  DROP TABLE "expertise_areas_locales" CASCADE;
  DROP TABLE "_expertise_areas_v_version_challenges" CASCADE;
  DROP TABLE "_expertise_areas_v_version_services" CASCADE;
  DROP TABLE "_expertise_areas_v_version_audiences" CASCADE;
  DROP TABLE "_expertise_areas_v" CASCADE;
  DROP TABLE "_expertise_areas_v_locales" CASCADE;
  DROP TABLE "experiences_countries" CASCADE;
  DROP TABLE "experiences_countries_locales" CASCADE;
  DROP TABLE "experiences_responsibilities" CASCADE;
  DROP TABLE "experiences_results" CASCADE;
  DROP TABLE "experiences" CASCADE;
  DROP TABLE "experiences_locales" CASCADE;
  DROP TABLE "experiences_rels" CASCADE;
  DROP TABLE "_experiences_v_version_countries" CASCADE;
  DROP TABLE "_experiences_v_version_countries_locales" CASCADE;
  DROP TABLE "_experiences_v_version_responsibilities" CASCADE;
  DROP TABLE "_experiences_v_version_results" CASCADE;
  DROP TABLE "_experiences_v" CASCADE;
  DROP TABLE "_experiences_v_locales" CASCADE;
  DROP TABLE "_experiences_v_rels" CASCADE;
  DROP TABLE "insights" CASCADE;
  DROP TABLE "insights_locales" CASCADE;
  DROP TABLE "insights_rels" CASCADE;
  DROP TABLE "_insights_v" CASCADE;
  DROP TABLE "_insights_v_locales" CASCADE;
  DROP TABLE "_insights_v_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "books_audience" CASCADE;
  DROP TABLE "books_book_language" CASCADE;
  DROP TABLE "books_format" CASCADE;
  DROP TABLE "books_purchase_links" CASCADE;
  DROP TABLE "books_purchase_links_locales" CASCADE;
  DROP TABLE "books" CASCADE;
  DROP TABLE "books_locales" CASCADE;
  DROP TABLE "books_rels" CASCADE;
  DROP TABLE "_books_v_version_audience" CASCADE;
  DROP TABLE "_books_v_version_book_language" CASCADE;
  DROP TABLE "_books_v_version_format" CASCADE;
  DROP TABLE "_books_v_version_purchase_links" CASCADE;
  DROP TABLE "_books_v_version_purchase_links_locales" CASCADE;
  DROP TABLE "_books_v" CASCADE;
  DROP TABLE "_books_v_locales" CASCADE;
  DROP TABLE "_books_v_rels" CASCADE;
  DROP TABLE "businesses" CASCADE;
  DROP TABLE "businesses_locales" CASCADE;
  DROP TABLE "_businesses_v" CASCADE;
  DROP TABLE "_businesses_v_locales" CASCADE;
  DROP TABLE "credentials" CASCADE;
  DROP TABLE "credentials_locales" CASCADE;
  DROP TABLE "_credentials_v" CASCADE;
  DROP TABLE "_credentials_v_locales" CASCADE;
  DROP TABLE "legal_pages" CASCADE;
  DROP TABLE "legal_pages_locales" CASCADE;
  DROP TABLE "_legal_pages_v" CASCADE;
  DROP TABLE "_legal_pages_v_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "documents_locales" CASCADE;
  DROP TABLE "contact_submissions" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_social" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "appearance" CASCADE;
  DROP TABLE "home_page_hero_key_points" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "home_page_locales" CASCADE;
  DROP TABLE "_home_page_v_version_hero_key_points" CASCADE;
  DROP TABLE "_home_page_v" CASCADE;
  DROP TABLE "_home_page_v_locales" CASCADE;
  DROP TABLE "about_page_values" CASCADE;
  DROP TABLE "about_page_languages" CASCADE;
  DROP TABLE "about_page_languages_locales" CASCADE;
  DROP TABLE "about_page_regions" CASCADE;
  DROP TABLE "about_page_regions_locales" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TABLE "about_page_locales" CASCADE;
  DROP TABLE "_about_page_v_version_values" CASCADE;
  DROP TABLE "_about_page_v_version_languages" CASCADE;
  DROP TABLE "_about_page_v_version_languages_locales" CASCADE;
  DROP TABLE "_about_page_v_version_regions" CASCADE;
  DROP TABLE "_about_page_v_version_regions_locales" CASCADE;
  DROP TABLE "_about_page_v" CASCADE;
  DROP TABLE "_about_page_v_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_expertise_areas_icon";
  DROP TYPE "public"."enum_expertise_areas_status";
  DROP TYPE "public"."enum__expertise_areas_v_version_icon";
  DROP TYPE "public"."enum__expertise_areas_v_version_status";
  DROP TYPE "public"."enum__expertise_areas_v_published_locale";
  DROP TYPE "public"."enum_experiences_type";
  DROP TYPE "public"."enum_experiences_region";
  DROP TYPE "public"."enum_experiences_status";
  DROP TYPE "public"."enum__experiences_v_version_type";
  DROP TYPE "public"."enum__experiences_v_version_region";
  DROP TYPE "public"."enum__experiences_v_version_status";
  DROP TYPE "public"."enum__experiences_v_published_locale";
  DROP TYPE "public"."enum_insights_status";
  DROP TYPE "public"."enum__insights_v_version_status";
  DROP TYPE "public"."enum__insights_v_published_locale";
  DROP TYPE "public"."enum_books_book_language";
  DROP TYPE "public"."enum_books_format";
  DROP TYPE "public"."enum_books_currency";
  DROP TYPE "public"."enum_books_availability";
  DROP TYPE "public"."enum_books_sale_type";
  DROP TYPE "public"."enum_books_status";
  DROP TYPE "public"."enum__books_v_version_book_language";
  DROP TYPE "public"."enum__books_v_version_format";
  DROP TYPE "public"."enum__books_v_version_currency";
  DROP TYPE "public"."enum__books_v_version_availability";
  DROP TYPE "public"."enum__books_v_version_sale_type";
  DROP TYPE "public"."enum__books_v_version_status";
  DROP TYPE "public"."enum__books_v_published_locale";
  DROP TYPE "public"."enum_businesses_status";
  DROP TYPE "public"."enum__businesses_v_version_status";
  DROP TYPE "public"."enum__businesses_v_published_locale";
  DROP TYPE "public"."enum_credentials_kind";
  DROP TYPE "public"."enum_credentials_status";
  DROP TYPE "public"."enum__credentials_v_version_kind";
  DROP TYPE "public"."enum__credentials_v_version_status";
  DROP TYPE "public"."enum__credentials_v_published_locale";
  DROP TYPE "public"."enum_legal_pages_type";
  DROP TYPE "public"."enum_legal_pages_status";
  DROP TYPE "public"."enum__legal_pages_v_version_type";
  DROP TYPE "public"."enum__legal_pages_v_version_status";
  DROP TYPE "public"."enum__legal_pages_v_published_locale";
  DROP TYPE "public"."enum_documents_kind";
  DROP TYPE "public"."enum_contact_submissions_request_type";
  DROP TYPE "public"."enum_contact_submissions_status";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_site_settings_social_platform";
  DROP TYPE "public"."enum_appearance_palette";
  DROP TYPE "public"."enum_appearance_heading_font";
  DROP TYPE "public"."enum_appearance_hero_style";
  DROP TYPE "public"."enum_appearance_hero_intensity";`)
}
