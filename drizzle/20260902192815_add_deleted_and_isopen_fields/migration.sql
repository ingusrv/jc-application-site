ALTER TABLE [applications] ADD [deleted] bit NOT NULL CONSTRAINT [applications_deleted_default] DEFAULT ((0));--> statement-breakpoint
ALTER TABLE [clubs] ADD [is_open] bit NOT NULL CONSTRAINT [clubs_is_open_default] DEFAULT ((0));--> statement-breakpoint
ALTER TABLE [clubs] ADD [deleted] bit NOT NULL CONSTRAINT [clubs_deleted_default] DEFAULT ((0));