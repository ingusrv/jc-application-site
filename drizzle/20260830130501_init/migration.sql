CREATE TABLE [applications] (
	[id] int IDENTITY(1, 1),
	[first_name] nvarchar(100) NOT NULL,
	[last_name] nvarchar(100) NOT NULL,
	[person_code] nvarchar(12) NOT NULL,
	[email] nvarchar(255),
	[phone] nvarchar(20),
	[address] nvarchar(255) NOT NULL,
	[educational_institution] nvarchar(255) NOT NULL,
	[grade] int NOT NULL,
	[primary_guardian_first_name] nvarchar(100) NOT NULL,
	[primary_guardian_last_name] nvarchar(100) NOT NULL,
	[primary_guardian_email] nvarchar(255),
	[primary_guardian_phone] nvarchar(20),
	[secondary_guardian_first_name] nvarchar(100),
	[secondary_guardian_last_name] nvarchar(100),
	[secondary_guardian_email] nvarchar(255),
	[secondary_guardian_phone] nvarchar(20),
	[club_id] int NOT NULL,
	[status] nvarchar(50) NOT NULL CONSTRAINT [applications_status_default] DEFAULT ('apstrādē'),
	[priority] int NOT NULL CONSTRAINT [applications_priority_default] DEFAULT ((0)),
	[created_at] datetime2 NOT NULL CONSTRAINT [applications_created_at_default] DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT [applications_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [clubs] (
	[id] int IDENTITY(1, 1),
	[name] nvarchar(255) NOT NULL,
	[min_grade] int NOT NULL,
	[max_grade] int NOT NULL,
	[max_participants] int NOT NULL,
	[schedule] nvarchar(255) NOT NULL,
	[description] nvarchar(1000),
	[created_at] datetime2 NOT NULL CONSTRAINT [clubs_created_at_default] DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT [clubs_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
ALTER TABLE [applications] ADD CONSTRAINT [applications_club_id_clubs_id_fk] FOREIGN KEY ([club_id]) REFERENCES [clubs]([id]);