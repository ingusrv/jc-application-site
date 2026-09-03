import { getDb } from "$lib/server/db";
import { applicationsTable, clubsTable, type Club } from "$lib/server/db/schema";
import type { PageServerLoad, Actions } from "./$types";
import { fail, message, superValidate } from "sveltekit-superforms";
import { applicationFormSchema } from "./applicationFormSchema";
import { zod4 } from "sveltekit-superforms/adapters";
import { and, count, asc, eq } from "drizzle-orm";

export type ClubWithApplicationCount = Club & { applicationCount: number };

export const load: PageServerLoad = async () => {
    let clubs: ClubWithApplicationCount[] = [];
    let errorMessage: string | null = null;

    try {
        const db = await getDb();
        const clubsFromDb = await db
            .select()
            .from(clubsTable)
            .where(
                and(
                    eq(clubsTable.deleted, false),
                    eq(clubsTable.isOpen, true),
                ),
            )
            .orderBy(asc(clubsTable.minGrade)) as Club[];

        // Fetch application count for each club
        const applicationCounts = await db
            .select({
                clubId: applicationsTable.clubId,
                count: count(applicationsTable.id),
            })
            .from(applicationsTable)
            .where(eq(applicationsTable.deleted, false))
            .groupBy(applicationsTable.clubId);

        // Create a map for easy lookup
        const countMap = new Map(applicationCounts.map(ac => [ac.clubId, ac.count]));

        // Attach application count to each club
        clubs = clubsFromDb.map(club => ({
            ...club,
            applicationCount: countMap.get(club.id) || 0,
        }));
    } catch (err: any) {
        console.error("Database error while fetching data:", err);
        errorMessage = "Pulciņi nav pieejami sistēmas kļūdas dēļ";
    }

    return {
        form: await superValidate(zod4(applicationFormSchema)),
        clubs: clubs,
        errorMessage: errorMessage,
    }
};

export const actions: Actions = {
    default: async ({ request }) => {
        const form = await superValidate(request, zod4(applicationFormSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        try {
            const db = await getDb();

            const openClub = await db
                .select({ id: clubsTable.id })
                .from(clubsTable)
                .where(
                    and(
                        eq(clubsTable.id, form.data.clubId),
                        eq(clubsTable.deleted, false),
                        eq(clubsTable.isOpen, true),
                    ),
                );

            if (openClub.length === 0) {
                return fail(400, {
                    form,
                    submissionError: "Izvēlētais pulciņš vairs nepieņem pieteikumus",
                });
            }

            const personCode = form.data.personCode.trim();
            const existingApplication = await db
                .select({ id: applicationsTable.id })
                .from(applicationsTable)
                .where(
                    and(
                        eq(applicationsTable.personCode, personCode),
                        eq(applicationsTable.clubId, form.data.clubId),
                        eq(applicationsTable.deleted, false),
                    ),
                );

            if (existingApplication.length > 0) {
                return fail(400, {
                    form,
                    submissionError: "Šis dalībnieks jau ir pieteikts izvēlētajam pulciņam",
                });
            }

            // Count existing applications with the same person code
            const existingAppsResult = await db
                .select({ count: count(applicationsTable.id) })
                .from(applicationsTable)
                .where(
                    and(
                        eq(applicationsTable.personCode, personCode),
                        eq(applicationsTable.deleted, false),
                    ),
                );

            const existingAppCount = existingAppsResult[0]?.count || 0;

            // Calculate priority: after 3rd application, decrease by 1 for each additional
            // 4th app gets -1, 5th gets -2, etc.
            let priority = 0;
            if (existingAppCount >= 3) {
                priority = -(existingAppCount - 3);
            }

            await db.insert(applicationsTable).values({
                firstName: form.data.firstName,
                lastName: form.data.lastName,
                personCode: personCode,
                email: form.data.email || null,
                phone: form.data.phone || null,
                address: form.data.address,
                educationalInstitution: form.data.educationalInstitution,
                grade: form.data.grade,
                primaryGuardianFirstName: form.data.primaryGuardianFirstName,
                primaryGuardianLastName: form.data.primaryGuardianLastName,
                primaryGuardianEmail: form.data.primaryGuardianEmail,
                primaryGuardianPhone: form.data.primaryGuardianPhone,
                secondaryGuardianFirstName: form.data.secondaryGuardianFirstName || null,
                secondaryGuardianLastName: form.data.secondaryGuardianLastName || null,
                secondaryGuardianEmail: form.data.secondaryGuardianEmail || null,
                secondaryGuardianPhone: form.data.secondaryGuardianPhone || null,
                clubId: form.data.clubId,
                status: "apstrādē",
                priority: priority,
            });

            return message(form, "Pieteikums ir veiksmīgi nosūtīts!");
        } catch (err: any) {
            console.error("Database error while submitting application:", err);
            return fail(500, { form, submissionError: "Radās kļūda" });
        }
    },
};