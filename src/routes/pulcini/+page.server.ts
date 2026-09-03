import { getDb } from '$lib/server/db';
import { clubsTable, type Club } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';
import { asc, eq } from 'drizzle-orm';
import { requireRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ fetch }) => {
    await requireRole(fetch, 'admin');

    try {
        const db = await getDb();
        const clubs = await db
            .select()
            .from(clubsTable)
            .where(eq(clubsTable.deleted, false))
            .orderBy(asc(clubsTable.name)) as Club[];

        return {
            clubs: clubs,
            errorMessage: null,
        };
    } catch (err: any) {
        console.error("Database error while fetching clubs:", err);
        return {
            clubs: [],
            errorMessage: "Pulciņi nav pieejami sistēmas kļūdas dēļ",
        };
    }
}

export const actions: Actions = {
    createClub: async ({ request, fetch }) => {
        await requireRole(fetch, 'admin');

        const formData = await request.formData();
        const name = formData.get('name') as string;
        const minGrade = parseInt(formData.get('minGrade') as string, 10);
        const maxGrade = parseInt(formData.get('maxGrade') as string, 10);
        const maxParticipants = parseInt(formData.get('maxParticipants') as string, 10);
        const schedule = formData.get('schedule') as string;
        const description = formData.get('description') as string;
        const isOpen = formData.get('isOpen') === 'on';

        try {
            const db = await getDb();
            await db.insert(clubsTable).values({
                name,
                minGrade: minGrade,
                maxGrade: maxGrade,
                maxParticipants,
                description,
                schedule,
                isOpen,
            });

            return { success: true };
        } catch (err: any) {
            console.error("Database error while adding club:", err);
            return { success: false, error: "Sistēmas kļūda" };
        }
    },
    updateClub: async ({ request, fetch }) => {
        await requireRole(fetch, 'admin');

        const formData = await request.formData();
        const id = parseInt(formData.get('id') as string, 10);
        const name = formData.get('name') as string;
        const minGrade = parseInt(formData.get('minGrade') as string, 10);
        const maxGrade = parseInt(formData.get('maxGrade') as string, 10);
        const maxParticipants = parseInt(formData.get('maxParticipants') as string, 10);
        const schedule = formData.get('schedule') as string;
        const description = formData.get('description') as string;
        const isOpen = formData.get('isOpen') === 'on';

        try {
            const db = await getDb();
            await db.update(clubsTable)
                .set({
                    name,
                    minGrade,
                    maxGrade,
                    maxParticipants,
                    schedule,
                    description,
                    isOpen,
                })
                .where(eq(clubsTable.id, id));

            return { success: true };
        } catch (err: any) {
            console.error("Database error while editing club:", err);
            return { success: false, error: "Sistēmas kļūda" };
        }
    },
    deleteClub: async ({ request, fetch }) => {
        await requireRole(fetch, 'admin');

        const formData = await request.formData();
        const id = parseInt(formData.get('id') as string, 10);

        try {
            const db = await getDb();
            await db.update(clubsTable)
                .set({ deleted: true })
                .where(eq(clubsTable.id, id));

            return { success: true };
        } catch (err: any) {
            console.error("Database error while deleting club:", err);
            return { success: false, error: "Sistēmas kļūda" };
        }
    },
};