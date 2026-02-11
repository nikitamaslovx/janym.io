CREATE TABLE IF NOT EXISTS "bot_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_id" uuid NOT NULL,
	"level" text NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bot_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_id" uuid NOT NULL,
	"timestamp" timestamp NOT NULL,
	"balance_usd" numeric(20, 8),
	"total_pnl" numeric(20, 8),
	"total_pnl_pct" numeric(10, 4),
	"active_orders_count" integer,
	"filled_orders_count" integer,
	"volume_24h" numeric(20, 8),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"strategy_type" text NOT NULL,
	"exchange" text NOT NULL,
	"trading_pair" text NOT NULL,
	"config" jsonb NOT NULL,
	"status" text DEFAULT 'stopped' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exchange_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"exchange" text NOT NULL,
	"api_key_encrypted" text NOT NULL,
	"api_secret_encrypted" text NOT NULL,
	"passphrase_encrypted" text,
	"is_testnet" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_id" uuid NOT NULL,
	"exchange_order_id" text,
	"trading_pair" text NOT NULL,
	"order_type" text NOT NULL,
	"order_side" text NOT NULL,
	"price" numeric(20, 8),
	"quantity" numeric(20, 8),
	"filled_quantity" numeric(20, 8),
	"status" text NOT NULL,
	"exchange_timestamp" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bot_logs" ADD CONSTRAINT "bot_logs_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bot_metrics" ADD CONSTRAINT "bot_metrics_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bots" ADD CONSTRAINT "bots_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exchange_credentials" ADD CONSTRAINT "exchange_credentials_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bot_logs_bot_id_created_at_idx" ON "bot_logs" USING btree ("bot_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bot_metrics_bot_id_timestamp_idx" ON "bot_metrics" USING btree ("bot_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bots_organization_id_status_idx" ON "bots" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "exchange_credentials_organization_id_exchange_idx" ON "exchange_credentials" USING btree ("organization_id","exchange");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_bot_id_created_at_idx" ON "orders" USING btree ("bot_id","created_at");