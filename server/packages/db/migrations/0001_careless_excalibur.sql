CREATE SCHEMA "page";
--> statement-breakpoint
CREATE TABLE "page"."pageContents" (
	"id" varchar(34) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"data" jsonb,
	"page_id" varchar(34) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page"."pages" (
	"id" varchar(34) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"favourite" boolean,
	"icon" text,
	"banner" text,
	"index" integer DEFAULT 0,
	"title" varchar(120),
	"parent_page_id" varchar(34),
	"workspace_id" varchar(34) NOT NULL,
	"created_by" varchar(34) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspace"."workspace" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "page"."pageContents" ADD CONSTRAINT "pageContents_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "page"."pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page"."pages" ADD CONSTRAINT "pages_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page"."pages" ADD CONSTRAINT "pages_created_by_workspace_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "workspace"."workspace_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pageContents_page_id_index" ON "page"."pageContents" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "pages_created_by_index" ON "page"."pages" USING btree ("created_by");