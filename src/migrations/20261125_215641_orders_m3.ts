import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" ADD COLUMN "anonymize_now" boolean DEFAULT false;
  ALTER TABLE "orders" ADD COLUMN "anonymized_at" timestamp(3) with time zone;
  CREATE SEQUENCE IF NOT EXISTS "order_ref_seq" START 1;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" DROP COLUMN "anonymize_now";
  ALTER TABLE "orders" DROP COLUMN "anonymized_at";
  DROP SEQUENCE IF EXISTS "order_ref_seq";`)
}
