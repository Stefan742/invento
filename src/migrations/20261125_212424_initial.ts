import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('mk', 'en');
  CREATE TYPE "public"."enum_kits_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__kits_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__kits_v_published_locale" AS ENUM('mk', 'en');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('new', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled');
  CREATE TYPE "public"."enum_orders_preferred_contact" AS ENUM('viber', 'phone', 'email');
  CREATE TYPE "public"."enum_orders_locale" AS ENUM('mk', 'en');
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('cash_on_delivery');
  CREATE TYPE "public"."enum_pages_slug" AS ENUM('about', 'shipping', 'returns', 'privacy', 'terms');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_slug" AS ENUM('about', 'shipping', 'returns', 'privacy', 'terms');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('mk', 'en');
  CREATE TYPE "public"."enum_faqs_category" AS ENUM('orders', 'delivery', 'kits', 'safety', 'other');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin');
  CREATE TYPE "public"."enum_home_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_page_v_published_locale" AS ENUM('mk', 'en');
  CREATE TABLE "kits_whats_in_the_box" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "kits_what_you_need_at_home" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "kits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"price_m_k_d" numeric,
  	"coming_soon" boolean DEFAULT false,
  	"stock_total" numeric,
  	"stock_remaining" numeric,
  	"next_drop_date" timestamp(3) with time zone,
  	"age_min" numeric DEFAULT 6,
  	"age_max" numeric DEFAULT 12,
  	"difficulty" numeric DEFAULT 1,
  	"build_time_minutes" numeric,
  	"seo_og_image_id" integer,
  	"slug" varchar,
  	"featured" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 0,
  	"is_placeholder" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_kits_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "kits_locales" (
  	"title" varchar,
  	"short_description" varchar,
  	"description" jsonb,
  	"lead_time_text" varchar,
  	"safety_notes" varchar,
  	"materials" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "kits_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_kits_v_version_whats_in_the_box" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_kits_v_version_what_you_need_at_home" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_kits_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_hero_image_id" integer,
  	"version_price_m_k_d" numeric,
  	"version_coming_soon" boolean DEFAULT false,
  	"version_stock_total" numeric,
  	"version_stock_remaining" numeric,
  	"version_next_drop_date" timestamp(3) with time zone,
  	"version_age_min" numeric DEFAULT 6,
  	"version_age_max" numeric DEFAULT 12,
  	"version_difficulty" numeric DEFAULT 1,
  	"version_build_time_minutes" numeric,
  	"version_seo_og_image_id" integer,
  	"version_slug" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_is_placeholder" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__kits_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__kits_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_kits_v_locales" (
  	"version_title" varchar,
  	"version_short_description" varchar,
  	"version_description" jsonb,
  	"version_lead_time_text" varchar,
  	"version_safety_notes" varchar,
  	"version_materials" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_kits_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kit_id" integer,
  	"title_snapshot" varchar NOT NULL,
  	"price_snapshot" numeric,
  	"quantity" numeric NOT NULL
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ref" varchar,
  	"status" "enum_orders_status" DEFAULT 'new' NOT NULL,
  	"customer_name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"preferred_contact" "enum_orders_preferred_contact" DEFAULT 'viber',
  	"city" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"notes" varchar,
  	"locale" "enum_orders_locale" DEFAULT 'mk',
  	"subtotal" numeric,
  	"shipping_fee" numeric,
  	"total" numeric,
  	"payment_method" "enum_orders_payment_method" DEFAULT 'cash_on_delivery' NOT NULL,
  	"privacy_consent" boolean DEFAULT false NOT NULL,
  	"public_token" varchar,
  	"stock_restored" boolean DEFAULT false,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" "enum_pages_slug",
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" "enum__pages_v_version_slug",
  	"version_seo_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_content" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" "enum_faqs_category",
  	"is_published" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs_locales" (
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"author_name" varchar NOT NULL,
  	"kit_id" integer,
  	"is_published" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 0,
  	"is_placeholder" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials_locales" (
  	"quote" varchar NOT NULL,
  	"author_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "builds" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kit_id" integer,
  	"builder_first_name" varchar,
  	"consent_confirmed" boolean DEFAULT false,
  	"is_published" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 0,
  	"is_placeholder" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "builds_locales" (
  	"title" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "builds_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
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
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
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
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
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
  	"kits_id" integer,
  	"orders_id" integer,
  	"pages_id" integer,
  	"faqs_id" integer,
  	"testimonials_id" integer,
  	"builds_id" integer,
  	"media_id" integer,
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
  
  CREATE TABLE "home_page_how_it_works" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "home_page_how_it_works_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sections_show_showcase" boolean DEFAULT true,
  	"sections_show_how_it_works" boolean DEFAULT true,
  	"sections_show_pick_your_box" boolean DEFAULT true,
  	"sections_show_testimonials" boolean DEFAULT true,
  	"sections_show_questions" boolean DEFAULT true,
  	"sections_show_gallery" boolean DEFAULT true,
  	"_status" "enum_home_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_locales" (
  	"hero_word1" varchar,
  	"hero_word2" varchar,
  	"hero_word3" varchar,
  	"hero_subline" varchar,
  	"intro" varchar,
  	"titles_showcase" varchar,
  	"titles_how_it_works" varchar,
  	"titles_pick_your_box" varchar,
  	"titles_testimonials" varchar,
  	"titles_questions" varchar,
  	"titles_gallery" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "home_page_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"kits_id" integer
  );
  
  CREATE TABLE "_home_page_v_version_how_it_works" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_how_it_works_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_home_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_sections_show_showcase" boolean DEFAULT true,
  	"version_sections_show_how_it_works" boolean DEFAULT true,
  	"version_sections_show_pick_your_box" boolean DEFAULT true,
  	"version_sections_show_testimonials" boolean DEFAULT true,
  	"version_sections_show_questions" boolean DEFAULT true,
  	"version_sections_show_gallery" boolean DEFAULT true,
  	"version__status" "enum__home_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__home_page_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_home_page_v_locales" (
  	"version_hero_word1" varchar,
  	"version_hero_word2" varchar,
  	"version_hero_word3" varchar,
  	"version_hero_subline" varchar,
  	"version_intro" varchar,
  	"version_titles_showcase" varchar,
  	"version_titles_how_it_works" varchar,
  	"version_titles_pick_your_box" varchar,
  	"version_titles_testimonials" varchar,
  	"version_titles_questions" varchar,
  	"version_titles_gallery" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_home_page_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"kits_id" integer
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"orders_open" boolean DEFAULT true,
  	"max_quantity_per_line" numeric DEFAULT 5,
  	"shipping_flat_fee" numeric,
  	"viber_number" varchar,
  	"phone_display" varchar,
  	"email" varchar,
  	"instagram_handle" varchar,
  	"instagram_url" varchar,
  	"announcement_bar_enabled" boolean DEFAULT false,
  	"announcement_bar_link" varchar,
  	"site_name" varchar DEFAULT 'INVENTO',
  	"default_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"orders_closed_message" varchar,
  	"shipping_note" varchar,
  	"order_success_note" varchar,
  	"city" varchar,
  	"announcement_bar_text" varchar,
  	"site_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "kits_whats_in_the_box" ADD CONSTRAINT "kits_whats_in_the_box_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."kits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "kits_what_you_need_at_home" ADD CONSTRAINT "kits_what_you_need_at_home_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."kits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "kits" ADD CONSTRAINT "kits_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kits" ADD CONSTRAINT "kits_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kits_locales" ADD CONSTRAINT "kits_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."kits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "kits_rels" ADD CONSTRAINT "kits_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."kits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "kits_rels" ADD CONSTRAINT "kits_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_kits_v_version_whats_in_the_box" ADD CONSTRAINT "_kits_v_version_whats_in_the_box_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_kits_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_kits_v_version_what_you_need_at_home" ADD CONSTRAINT "_kits_v_version_what_you_need_at_home_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_kits_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_kits_v" ADD CONSTRAINT "_kits_v_parent_id_kits_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."kits"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_kits_v" ADD CONSTRAINT "_kits_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_kits_v" ADD CONSTRAINT "_kits_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_kits_v_locales" ADD CONSTRAINT "_kits_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_kits_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_kits_v_rels" ADD CONSTRAINT "_kits_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_kits_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_kits_v_rels" ADD CONSTRAINT "_kits_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_kit_id_kits_id_fk" FOREIGN KEY ("kit_id") REFERENCES "public"."kits"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_locales" ADD CONSTRAINT "faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_kit_id_kits_id_fk" FOREIGN KEY ("kit_id") REFERENCES "public"."kits"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "builds" ADD CONSTRAINT "builds_kit_id_kits_id_fk" FOREIGN KEY ("kit_id") REFERENCES "public"."kits"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "builds_locales" ADD CONSTRAINT "builds_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."builds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "builds_rels" ADD CONSTRAINT "builds_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."builds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "builds_rels" ADD CONSTRAINT "builds_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_kits_fk" FOREIGN KEY ("kits_id") REFERENCES "public"."kits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_builds_fk" FOREIGN KEY ("builds_id") REFERENCES "public"."builds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_how_it_works" ADD CONSTRAINT "home_page_how_it_works_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_how_it_works_locales" ADD CONSTRAINT "home_page_how_it_works_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_how_it_works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_locales" ADD CONSTRAINT "home_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_kits_fk" FOREIGN KEY ("kits_id") REFERENCES "public"."kits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_how_it_works" ADD CONSTRAINT "_home_page_v_version_how_it_works_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_how_it_works_locales" ADD CONSTRAINT "_home_page_v_version_how_it_works_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v_version_how_it_works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_locales" ADD CONSTRAINT "_home_page_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_rels" ADD CONSTRAINT "_home_page_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_rels" ADD CONSTRAINT "_home_page_v_rels_kits_fk" FOREIGN KEY ("kits_id") REFERENCES "public"."kits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "kits_whats_in_the_box_order_idx" ON "kits_whats_in_the_box" USING btree ("_order");
  CREATE INDEX "kits_whats_in_the_box_parent_id_idx" ON "kits_whats_in_the_box" USING btree ("_parent_id");
  CREATE INDEX "kits_whats_in_the_box_locale_idx" ON "kits_whats_in_the_box" USING btree ("_locale");
  CREATE INDEX "kits_what_you_need_at_home_order_idx" ON "kits_what_you_need_at_home" USING btree ("_order");
  CREATE INDEX "kits_what_you_need_at_home_parent_id_idx" ON "kits_what_you_need_at_home" USING btree ("_parent_id");
  CREATE INDEX "kits_what_you_need_at_home_locale_idx" ON "kits_what_you_need_at_home" USING btree ("_locale");
  CREATE INDEX "kits_hero_image_idx" ON "kits" USING btree ("hero_image_id");
  CREATE INDEX "kits_seo_seo_og_image_idx" ON "kits" USING btree ("seo_og_image_id");
  CREATE UNIQUE INDEX "kits_slug_idx" ON "kits" USING btree ("slug");
  CREATE INDEX "kits_updated_at_idx" ON "kits" USING btree ("updated_at");
  CREATE INDEX "kits_created_at_idx" ON "kits" USING btree ("created_at");
  CREATE INDEX "kits__status_idx" ON "kits" USING btree ("_status");
  CREATE UNIQUE INDEX "kits_locales_locale_parent_id_unique" ON "kits_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "kits_locales_parent_id_idx" ON "kits_locales" USING btree ("_parent_id");
  CREATE INDEX "kits_rels_order_idx" ON "kits_rels" USING btree ("order");
  CREATE INDEX "kits_rels_parent_idx" ON "kits_rels" USING btree ("parent_id");
  CREATE INDEX "kits_rels_path_idx" ON "kits_rels" USING btree ("path");
  CREATE INDEX "kits_rels_media_id_idx" ON "kits_rels" USING btree ("media_id");
  CREATE INDEX "_kits_v_version_whats_in_the_box_order_idx" ON "_kits_v_version_whats_in_the_box" USING btree ("_order");
  CREATE INDEX "_kits_v_version_whats_in_the_box_parent_id_idx" ON "_kits_v_version_whats_in_the_box" USING btree ("_parent_id");
  CREATE INDEX "_kits_v_version_whats_in_the_box_locale_idx" ON "_kits_v_version_whats_in_the_box" USING btree ("_locale");
  CREATE INDEX "_kits_v_version_what_you_need_at_home_order_idx" ON "_kits_v_version_what_you_need_at_home" USING btree ("_order");
  CREATE INDEX "_kits_v_version_what_you_need_at_home_parent_id_idx" ON "_kits_v_version_what_you_need_at_home" USING btree ("_parent_id");
  CREATE INDEX "_kits_v_version_what_you_need_at_home_locale_idx" ON "_kits_v_version_what_you_need_at_home" USING btree ("_locale");
  CREATE INDEX "_kits_v_parent_idx" ON "_kits_v" USING btree ("parent_id");
  CREATE INDEX "_kits_v_version_version_hero_image_idx" ON "_kits_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_kits_v_version_seo_version_seo_og_image_idx" ON "_kits_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_kits_v_version_version_slug_idx" ON "_kits_v" USING btree ("version_slug");
  CREATE INDEX "_kits_v_version_version_updated_at_idx" ON "_kits_v" USING btree ("version_updated_at");
  CREATE INDEX "_kits_v_version_version_created_at_idx" ON "_kits_v" USING btree ("version_created_at");
  CREATE INDEX "_kits_v_version_version__status_idx" ON "_kits_v" USING btree ("version__status");
  CREATE INDEX "_kits_v_created_at_idx" ON "_kits_v" USING btree ("created_at");
  CREATE INDEX "_kits_v_updated_at_idx" ON "_kits_v" USING btree ("updated_at");
  CREATE INDEX "_kits_v_snapshot_idx" ON "_kits_v" USING btree ("snapshot");
  CREATE INDEX "_kits_v_published_locale_idx" ON "_kits_v" USING btree ("published_locale");
  CREATE INDEX "_kits_v_latest_idx" ON "_kits_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_kits_v_locales_locale_parent_id_unique" ON "_kits_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_kits_v_locales_parent_id_idx" ON "_kits_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_kits_v_rels_order_idx" ON "_kits_v_rels" USING btree ("order");
  CREATE INDEX "_kits_v_rels_parent_idx" ON "_kits_v_rels" USING btree ("parent_id");
  CREATE INDEX "_kits_v_rels_path_idx" ON "_kits_v_rels" USING btree ("path");
  CREATE INDEX "_kits_v_rels_media_id_idx" ON "_kits_v_rels" USING btree ("media_id");
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX "orders_items_kit_idx" ON "orders_items" USING btree ("kit_id");
  CREATE UNIQUE INDEX "orders_ref_idx" ON "orders" USING btree ("ref");
  CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");
  CREATE UNIQUE INDEX "orders_public_token_idx" ON "orders" USING btree ("public_token");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_seo_seo_og_image_idx" ON "pages" USING btree ("seo_og_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_seo_version_seo_og_image_idx" ON "_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "_pages_v_locales" USING btree ("_parent_id");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE UNIQUE INDEX "faqs_locales_locale_parent_id_unique" ON "faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faqs_locales_parent_id_idx" ON "faqs_locales" USING btree ("_parent_id");
  CREATE INDEX "testimonials_kit_idx" ON "testimonials" USING btree ("kit_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "testimonials_locales_parent_id_idx" ON "testimonials_locales" USING btree ("_parent_id");
  CREATE INDEX "builds_kit_idx" ON "builds" USING btree ("kit_id");
  CREATE INDEX "builds_updated_at_idx" ON "builds" USING btree ("updated_at");
  CREATE INDEX "builds_created_at_idx" ON "builds" USING btree ("created_at");
  CREATE UNIQUE INDEX "builds_locales_locale_parent_id_unique" ON "builds_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "builds_locales_parent_id_idx" ON "builds_locales" USING btree ("_parent_id");
  CREATE INDEX "builds_rels_order_idx" ON "builds_rels" USING btree ("order");
  CREATE INDEX "builds_rels_parent_idx" ON "builds_rels" USING btree ("parent_id");
  CREATE INDEX "builds_rels_path_idx" ON "builds_rels" USING btree ("path");
  CREATE INDEX "builds_rels_media_id_idx" ON "builds_rels" USING btree ("media_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_kits_id_idx" ON "payload_locked_documents_rels" USING btree ("kits_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_builds_id_idx" ON "payload_locked_documents_rels" USING btree ("builds_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
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
  CREATE INDEX "home_page_how_it_works_order_idx" ON "home_page_how_it_works" USING btree ("_order");
  CREATE INDEX "home_page_how_it_works_parent_id_idx" ON "home_page_how_it_works" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_page_how_it_works_locales_locale_parent_id_unique" ON "home_page_how_it_works_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_how_it_works_locales_parent_id_idx" ON "home_page_how_it_works_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page__status_idx" ON "home_page" USING btree ("_status");
  CREATE UNIQUE INDEX "home_page_locales_locale_parent_id_unique" ON "home_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_locales_parent_id_idx" ON "home_page_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_rels_order_idx" ON "home_page_rels" USING btree ("order");
  CREATE INDEX "home_page_rels_parent_idx" ON "home_page_rels" USING btree ("parent_id");
  CREATE INDEX "home_page_rels_path_idx" ON "home_page_rels" USING btree ("path");
  CREATE INDEX "home_page_rels_kits_id_idx" ON "home_page_rels" USING btree ("kits_id");
  CREATE INDEX "_home_page_v_version_how_it_works_order_idx" ON "_home_page_v_version_how_it_works" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_how_it_works_parent_id_idx" ON "_home_page_v_version_how_it_works" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_home_page_v_version_how_it_works_locales_locale_parent_id_u" ON "_home_page_v_version_how_it_works_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_home_page_v_version_how_it_works_locales_parent_id_idx" ON "_home_page_v_version_how_it_works_locales" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_version__status_idx" ON "_home_page_v" USING btree ("version__status");
  CREATE INDEX "_home_page_v_created_at_idx" ON "_home_page_v" USING btree ("created_at");
  CREATE INDEX "_home_page_v_updated_at_idx" ON "_home_page_v" USING btree ("updated_at");
  CREATE INDEX "_home_page_v_snapshot_idx" ON "_home_page_v" USING btree ("snapshot");
  CREATE INDEX "_home_page_v_published_locale_idx" ON "_home_page_v" USING btree ("published_locale");
  CREATE INDEX "_home_page_v_latest_idx" ON "_home_page_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_home_page_v_locales_locale_parent_id_unique" ON "_home_page_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_home_page_v_locales_parent_id_idx" ON "_home_page_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_rels_order_idx" ON "_home_page_v_rels" USING btree ("order");
  CREATE INDEX "_home_page_v_rels_parent_idx" ON "_home_page_v_rels" USING btree ("parent_id");
  CREATE INDEX "_home_page_v_rels_path_idx" ON "_home_page_v_rels" USING btree ("path");
  CREATE INDEX "_home_page_v_rels_kits_id_idx" ON "_home_page_v_rels" USING btree ("kits_id");
  CREATE INDEX "site_settings_default_og_image_idx" ON "site_settings" USING btree ("default_og_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "kits_whats_in_the_box" CASCADE;
  DROP TABLE "kits_what_you_need_at_home" CASCADE;
  DROP TABLE "kits" CASCADE;
  DROP TABLE "kits_locales" CASCADE;
  DROP TABLE "kits_rels" CASCADE;
  DROP TABLE "_kits_v_version_whats_in_the_box" CASCADE;
  DROP TABLE "_kits_v_version_what_you_need_at_home" CASCADE;
  DROP TABLE "_kits_v" CASCADE;
  DROP TABLE "_kits_v_locales" CASCADE;
  DROP TABLE "_kits_v_rels" CASCADE;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "faqs_locales" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "builds" CASCADE;
  DROP TABLE "builds_locales" CASCADE;
  DROP TABLE "builds_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_page_how_it_works" CASCADE;
  DROP TABLE "home_page_how_it_works_locales" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "home_page_locales" CASCADE;
  DROP TABLE "home_page_rels" CASCADE;
  DROP TABLE "_home_page_v_version_how_it_works" CASCADE;
  DROP TABLE "_home_page_v_version_how_it_works_locales" CASCADE;
  DROP TABLE "_home_page_v" CASCADE;
  DROP TABLE "_home_page_v_locales" CASCADE;
  DROP TABLE "_home_page_v_rels" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_kits_status";
  DROP TYPE "public"."enum__kits_v_version_status";
  DROP TYPE "public"."enum__kits_v_published_locale";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_preferred_contact";
  DROP TYPE "public"."enum_orders_locale";
  DROP TYPE "public"."enum_orders_payment_method";
  DROP TYPE "public"."enum_pages_slug";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_slug";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_faqs_category";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_home_page_status";
  DROP TYPE "public"."enum__home_page_v_version_status";
  DROP TYPE "public"."enum__home_page_v_published_locale";`)
}
