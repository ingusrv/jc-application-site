import { getDb } from '$lib/server/db';
import { applicationsTable, clubsTable, type Application } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';
import { desc, eq } from 'drizzle-orm';
import { requireRole } from '$lib/server/auth';

export type ApplicationWithClub = Application & {
    clubName: string;
    clubSchedule: string;
    clubMaxParticipants: number;
};

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
                clubSchedule: clubsTable.schedule,
                clubMaxParticipants: clubsTable.maxParticipants,
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

export const actions: Actions = {
    updateApplication: async ({ request, fetch }) => {
        await requireRole(fetch, 'admin');

        const formData = await request.formData();
        const id = parseInt(formData.get('id') as string, 10);
        const optionalValue = (name: string) => {
            const value = formData.get(name)?.toString().trim();
            return value || null;
        };

        try {
            const db = await getDb();
            await db.update(applicationsTable)
                .set({
                    firstName: formData.get('firstName') as string,
                    lastName: formData.get('lastName') as string,
                    personCode: formData.get('personCode') as string,
                    email: optionalValue('email'),
                    phone: optionalValue('phone'),
                    address: formData.get('address') as string,
                    educationalInstitution: formData.get('educationalInstitution') as string,
                    grade: parseInt(formData.get('grade') as string, 10),
                    primaryGuardianFirstName: formData.get('primaryGuardianFirstName') as string,
                    primaryGuardianLastName: formData.get('primaryGuardianLastName') as string,
                    primaryGuardianEmail: optionalValue('primaryGuardianEmail'),
                    primaryGuardianPhone: optionalValue('primaryGuardianPhone'),
                    secondaryGuardianFirstName: optionalValue('secondaryGuardianFirstName'),
                    secondaryGuardianLastName: optionalValue('secondaryGuardianLastName'),
                    secondaryGuardianEmail: optionalValue('secondaryGuardianEmail'),
                    secondaryGuardianPhone: optionalValue('secondaryGuardianPhone'),
                    status: formData.get('status') as string,
                    priority: parseInt(formData.get('priority') as string, 10),
                })
                .where(eq(applicationsTable.id, id));

            return { success: true };
        } catch (err: any) {
            console.error("Database error while editing application:", err);
            return { success: false, error: "Sistēmas kļūda" };
        }
    },
};