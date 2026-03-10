CREATE SCHEMA "user";
--> statement-breakpoint
CREATE SCHEMA "workspace";
--> statement-breakpoint
CREATE TYPE "workspace"."workspace_member_role" AS ENUM('owner', 'member', 'guest');--> statement-breakpoint
CREATE TABLE "user"."profile" (
	"id" varchar(34) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"username" varchar(50) NOT NULL,
	"profile_picture" text,
	"user_id" varchar(34) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user"."user" (
	"id" varchar(34) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"email" varchar(50) NOT NULL,
	"password" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace"."workspace_members" (
	"id" varchar(34) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"workspace_id" varchar(34) NOT NULL,
	"user_id" varchar(34) NOT NULL,
	"role" "workspace"."workspace_member_role" DEFAULT 'owner' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace"."workspace" (
	"id" varchar(34) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" varchar NOT NULL,
	"description" varchar,
	"owner_id" varchar(34) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user"."profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace"."workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace"."workspace_members" ADD CONSTRAINT "workspace_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace"."workspace" ADD CONSTRAINT "workspace_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "user"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "profile_user_id_index" ON "user"."profile" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_index" ON "user"."user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_members_workspace_id_user_id_index" ON "workspace"."workspace_members" USING btree ("workspace_id","user_id");