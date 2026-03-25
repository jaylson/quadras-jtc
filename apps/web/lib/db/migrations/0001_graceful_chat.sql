CREATE TABLE "managers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"shifts" json DEFAULT '[]'::json NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
