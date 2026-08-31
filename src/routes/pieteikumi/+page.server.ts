import { error, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { applicationsTable, type Application } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';
import { desc } from 'drizzle-orm';
import type { ClientPrincipal } from 'svelte-adapter-azure-swa';
import { requireRole } from '$lib/server/auth';


export const load: PageServerLoad = async ({ fetch, request }) => {
    await requireRole(fetch, 'admin');

    try {
        const db = await getDb();
        const applications = await db
            .select()
            .from(applicationsTable)
            .orderBy(desc(applicationsTable.priority)) as Application[];

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