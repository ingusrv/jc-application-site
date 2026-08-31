import { getDb } from "$lib/server/db";
import { applicationsTable, clubsTable, type Club } from "$lib/server/db/schema";
import type { PageServerLoad, Actions } from "./$types";
import { fail, message, superValidate } from "sveltekit-superforms";
import { applicationFormSchema } from "./applicationFormSchema";
import { zod4 } from "sveltekit-superforms/adapters";
import { count, asc } from "drizzle-orm";

export type ClubWithApplicationCount = Club & { applicationCount: number };

export const load: PageServerLoad = async () => {
    let clubs: ClubWithApplicationCount[] = [];
    let errorMessage: string | null = null;

    try {
        const db = await getDb();
        const clubsFromDb = await db
            .select()
            .from(clubsTable).orderBy(asc(clubsTable.minGrade)) as Club[];

        // Fetch application count for each club
        const applicationCounts = await db
            .select({
                clubId: applicationsTable.clubId,
                count: count(applicationsTable.id),
            })
            .from(applicationsTable)
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
            await db.insert(applicationsTable).values({
                firstName: form.data.firstName,
                lastName: form.data.lastName,
                personCode: form.data.personCode,
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
            });

            return message(form, "Pieteikums ir veiksmīgi nosūtīts!");
        } catch (err: any) {
            console.error("Database error while submitting application:", err);
            return message(
                form,
                `${err?.message || "Radās kļūda"}`,
                { status: 500 }
            );
        }
    },
};