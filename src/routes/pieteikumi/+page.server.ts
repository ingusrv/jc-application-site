import { getDb } from '$lib/server/db';
import { applicationsTable, clubsTable, type Application } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';
import { and, asc, desc, eq, lte, ne } from 'drizzle-orm';
import { requireRole } from '$lib/server/auth';

export type ApplicationWithClub = Application & {
    clubName: string;
    clubSchedule: string;
    clubMaxParticipants: number;
};

export type ClubOption = {
    id: number;
    name: string;
    schedule: string;
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
            .where(
                and(
                    eq(applicationsTable.deleted, false),
                    eq(clubsTable.deleted, false),
                ),
            )
            .orderBy(
                desc(applicationsTable.priority),
                asc(applicationsTable.createdAt),
                asc(applicationsTable.id),
            ) as ApplicationWithClub[];
        const clubs = await db
            .select({
                id: clubsTable.id,
                name: clubsTable.name,
                schedule: clubsTable.schedule,
            })
            .from(clubsTable)
            .where(eq(clubsTable.deleted, false))
            .orderBy(asc(clubsTable.name), asc(clubsTable.schedule)) as ClubOption[];

        return {
            applications: applications,
            clubs,
            errorMessage: null,
        };
    } catch (err: any) {
        console.error("Database error while fetching applications:", err);
        return {
            applications: [],
            clubs: [],
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
            const personCode = formData.get('personCode')?.toString().trim() ?? '';
            const clubId = parseInt(formData.get('clubId')?.toString() ?? '', 10);
            const selectedClub = await db
                .select({ id: clubsTable.id })
                .from(clubsTable)
                .where(
                    and(
                        eq(clubsTable.id, clubId),
                        eq(clubsTable.deleted, false),
                    ),
                );

            if (selectedClub.length === 0) {
                return { success: false, error: "Izvēlētais pulciņš nav pieejams" };
            }

            const existingApplication = await db
                .select({ id: applicationsTable.id })
                .from(applicationsTable)
                .where(
                    and(
                        eq(applicationsTable.personCode, personCode),
                        eq(applicationsTable.clubId, clubId),
                        eq(applicationsTable.deleted, false),
                        ne(applicationsTable.id, id),
                    ),
                );

            if (existingApplication.length > 0) {
                return { success: false, error: "Šis dalībnieks jau ir pieteikts šim pulciņam" };
            }

            await db.update(applicationsTable)
                .set({
                    firstName: formData.get('firstName') as string,
                    lastName: formData.get('lastName') as string,
                    personCode,
                    clubId,
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
    recalculatePriorities: async ({ fetch }) => {
        await requireRole(fetch, 'admin');

        try {
            const db = await getDb();
            const recalculationResult = await db.transaction(async (tx) => {
                const applications = await tx
                    .select({
                        id: applicationsTable.id,
                        personCode: applicationsTable.personCode,
                        priority: applicationsTable.priority,
                        createdAt: applicationsTable.createdAt,
                    })
                    .from(applicationsTable)
                    .where(eq(applicationsTable.deleted, false))
                    .orderBy(
                        asc(applicationsTable.personCode),
                        asc(applicationsTable.createdAt),
                        asc(applicationsTable.id),
                    );

                const sequencePositions = new Map<string, number>();
                let changedApplications = 0;

                for (const application of applications) {
                    const personCode = application.personCode.trim();
                    const position = sequencePositions.get(personCode) ?? 0;
                    sequencePositions.set(personCode, position + 1);

                    if (application.priority > 0) {
                        continue;
                    }

                    const recalculatedPriority = position < 3 ? 0 : -(position - 2);
                    if (application.priority === recalculatedPriority) {
                        continue;
                    }

                    await tx
                        .update(applicationsTable)
                        .set({ priority: recalculatedPriority })
                        .where(
                            and(
                                eq(applicationsTable.id, application.id),
                                lte(applicationsTable.priority, 0),
                            ),
                        );
                    changedApplications += 1;
                }

                return {
                    checkedCount: applications.length,
                    changedCount: changedApplications,
                };
            });

            return { success: true, ...recalculationResult };
        } catch (err: any) {
            console.error("Database error while recalculating priorities:", err);
            return { success: false, error: "Prioritātes neizdevās pārrēķināt" };
        }
    },
    deleteApplication: async ({ request, fetch }) => {
        await requireRole(fetch, 'admin');

        const formData = await request.formData();
        const id = parseInt(formData.get('id') as string, 10);

        try {
            const db = await getDb();
            await db.update(applicationsTable)
                .set({ deleted: true })
                .where(eq(applicationsTable.id, id));

            return { success: true };
        } catch (err: any) {
            console.error("Database error while deleting application:", err);
            return { success: false, error: "Sistēmas kļūda" };
        }
    },
};