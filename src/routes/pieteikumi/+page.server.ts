import { error, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { applicationsTable, clubsTable, type Application } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';
import { desc, eq } from 'drizzle-orm';
import { requireRole } from '$lib/server/auth';

export type ApplicationWithClub = Application & { clubName: string };

export const load: PageServerLoad = async ({ fetch, request }) => {
    await requireRole(fetch, 'admin');

    try {
        const db = await getDb();
        const applications = await db
            .select({
                id: applicationsTable.id,
                firstName: applicationsTable.firstName,
                lastName: applicationsTable.lastName,
                personCode: applicationsTable.personCode,
                email: applicationsTable.email,
                phone: applicationsTable.phone,
                address: applicationsTable.address,
                educationalInstitution: applicationsTable.educationalInstitution,
                grade: applicationsTable.grade,
                primaryGuardianFirstName: applicationsTable.primaryGuardianFirstName,
                primaryGuardianLastName: applicationsTable.primaryGuardianLastName,
                primaryGuardianEmail: applicationsTable.primaryGuardianEmail,
                primaryGuardianPhone: applicationsTable.primaryGuardianPhone,
                secondaryGuardianFirstName: applicationsTable.secondaryGuardianFirstName,
                secondaryGuardianLastName: applicationsTable.secondaryGuardianLastName,
                secondaryGuardianEmail: applicationsTable.secondaryGuardianEmail,
                secondaryGuardianPhone: applicationsTable.secondaryGuardianPhone,
                clubId: applicationsTable.clubId,
                status: applicationsTable.status,
                priority: applicationsTable.priority,
                createdAt: applicationsTable.createdAt,
                clubName: clubsTable.name,
            })
            .from(applicationsTable)
            .leftJoin(clubsTable, eq(applicationsTable.clubId, clubsTable.id))
            .orderBy(desc(applicationsTable.priority)) as ApplicationWithClub[];

        return {
            applications: applications,
            errorMessage: null,
        };
    } catch (err: any) {
        console.error("Database error while fetching applications:", err);
        return {
            applications: [],
            errorMessage: "Pieteikumi nav pieejami sistēmas kļūdas dēļ",
        };
    }
}