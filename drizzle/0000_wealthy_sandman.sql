CREATE TABLE "integrados" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"lote_number" text,
	"alojamento_date" text NOT NULL,
	"status" text NOT NULL,
	"fechamento_date" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "visits" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"integrado_id" text NOT NULL,
	"idade" integer NOT NULL,
	"recomendacao" text NOT NULL,
	"comedouro" text NOT NULL,
	"colaborador" text NOT NULL,
	"consumo_acumulado_real" real NOT NULL,
	"mortalidade" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_integrado_id_integrados_id_fk" FOREIGN KEY ("integrado_id") REFERENCES "public"."integrados"("id") ON DELETE cascade ON UPDATE no action;