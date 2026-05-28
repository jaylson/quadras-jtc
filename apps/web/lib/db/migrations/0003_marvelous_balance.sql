ALTER TABLE "courts" ADD COLUMN "usage_minutes_dry_singles" integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "courts" ADD COLUMN "usage_minutes_dry_doubles" integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "courts" ADD COLUMN "usage_minutes_rain_singles" integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "courts" ADD COLUMN "usage_minutes_rain_doubles" integer DEFAULT 60 NOT NULL;--> statement-breakpoint

UPDATE "courts"
SET
  "usage_minutes_dry_singles" = "usage_minutes_dry",
  "usage_minutes_dry_doubles" = "usage_minutes_dry",
  "usage_minutes_rain_singles" = "usage_minutes_rain",
  "usage_minutes_rain_doubles" = "usage_minutes_rain";--> statement-breakpoint

ALTER TABLE "courts" DROP COLUMN "usage_minutes_dry";--> statement-breakpoint
ALTER TABLE "courts" DROP COLUMN "usage_minutes_rain";