import { mssqlTable, int, nvarchar, datetime2, bit } from 'drizzle-orm/mssql-core';
import { sql } from 'drizzle-orm';

export const clubsTable = mssqlTable('clubs', {
	id: int('id').identity({ seed: 1, increment: 1 }).primaryKey(),
	name: nvarchar('name', { length: 255 }).notNull(),
	minGrade: int('min_grade').notNull(),
	maxGrade: int('max_grade').notNull(),
	maxParticipants: int('max_participants').notNull(),
	schedule: nvarchar('schedule', { length: 255 }).notNull(),
	description: nvarchar('description', { length: 1000 }),
	isOpen: bit('is_open').default(false).notNull(),
	deleted: bit('deleted').default(false).notNull(),
	createdAt: datetime2('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export type Club = typeof clubsTable.$inferSelect;

export const applicationsTable = mssqlTable('applications', {
	id: int('id').identity({ seed: 1, increment: 1 }).primaryKey(),
	firstName: nvarchar("first_name", { length: 100 }).notNull(),
	lastName: nvarchar('last_name', { length: 100 }).notNull(),
	personCode: nvarchar('person_code', { length: 12 }).notNull(),
	email: nvarchar('email', { length: 255 }),
	phone: nvarchar('phone', { length: 20 }),
	address: nvarchar('address', { length: 255 }).notNull(),
	educationalInstitution: nvarchar('educational_institution', { length: 255 }).notNull(),
	grade: int('grade').notNull(),
	primaryGuardianFirstName: nvarchar('primary_guardian_first_name', { length: 100 }).notNull(),
	primaryGuardianLastName: nvarchar('primary_guardian_last_name', { length: 100 }).notNull(),
	primaryGuardianEmail: nvarchar('primary_guardian_email', { length: 255 }),
	primaryGuardianPhone: nvarchar('primary_guardian_phone', { length: 20 }),
	secondaryGuardianFirstName: nvarchar('secondary_guardian_first_name', { length: 100 }),
	secondaryGuardianLastName: nvarchar('secondary_guardian_last_name', { length: 100 }),
	secondaryGuardianEmail: nvarchar('secondary_guardian_email', { length: 255 }),
	secondaryGuardianPhone: nvarchar('secondary_guardian_phone', { length: 20 }),
	clubId: int('club_id').references(() => clubsTable.id).notNull(),
	status: nvarchar('status', { length: 50 }).default('apstrādē').notNull(),
	priority: int('priority').default(0).notNull(),
	deleted: bit('deleted').default(false).notNull(),
	createdAt: datetime2('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export type Application = typeof applicationsTable.$inferSelect;
export type NewApplication = typeof applicationsTable.$inferInsert;
