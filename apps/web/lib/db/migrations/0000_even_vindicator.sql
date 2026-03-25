CREATE TYPE "public"."category" AS ENUM('aula', 'campeonato', 'evento', 'manutencao', 'outro');--> statement-breakpoint
CREATE TYPE "public"."recurring" AS ENUM('nenhuma', 'semanal');--> statement-breakpoint
CREATE TYPE "public"."surface" AS ENUM('saibro', 'hard', 'grama');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('coberta', 'descoberta');--> statement-breakpoint
CREATE TYPE "public"."game_type" AS ENUM('simples', 'duplas');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('em uso', 'agendada', 'concluída');--> statement-breakpoint
CREATE TABLE "admin_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"category" "category" NOT NULL,
	"court_ids" json NOT NULL,
	"date" date NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"recurring" "recurring" DEFAULT 'nenhuma' NOT NULL,
	"notes" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "courts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" "type" NOT NULL,
	"surface" "surface" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"deactivate_start" date,
	"deactivate_end" date,
	"usage_minutes_dry" integer DEFAULT 60 NOT NULL,
	"usage_minutes_rain" integer DEFAULT 60 NOT NULL,
	"interval_minutes" integer DEFAULT 15 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"court_id" integer NOT NULL,
	"court_name" varchar(100) NOT NULL,
	"player_name" varchar(500) NOT NULL,
	"player_phone" varchar(20) NOT NULL,
	"players" json NOT NULL,
	"game_type" "game_type" NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"status" "status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(50) PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_court_id_courts_id_fk" FOREIGN KEY ("court_id") REFERENCES "public"."courts"("id") ON DELETE no action ON UPDATE no action;