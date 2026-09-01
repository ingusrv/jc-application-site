import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';

export type AppServicePrincipal = {
    user_id: string;
    user_claims: Array<{
        typ: string;
        val: string;
    }>;
};

const ROLE_CLAIM_TYPE = 'roles';

function isAuthEnabled() {
    return env.PUBLIC_ENABLE_AUTH === 'true';
}

export async function requireRole(
    fetch: typeof globalThis.fetch,
    role: string
) {
    if (!isAuthEnabled()) {
        return;
    }

    let res: Response | null = null;

    try {
        res = await fetch('/.auth/me');
    } catch (err) {
        console.error("Error while fetching /.auth/me:", err);
        throw error(500, 'Internal server error');
    }

    if (!res.ok) {
        throw error(401, 'Not authenticated');
    }

    const text = await res.text();

    if (!text) {
        throw error(401, 'Not authenticated');
    }

    let principals: AppServicePrincipal[] | null = null;
    try {
        principals = JSON.parse(text) as AppServicePrincipal[];
    } catch (err) {
        console.error("Error while parsing JSON from /.auth/me:", err);
        throw error(500, 'Internal server error');
    }

    const principal = principals[0];

    if (!principal) {
        throw error(401, 'Not authenticated');
    }

    const roles = principal.user_claims
        .filter((c) => c.typ === ROLE_CLAIM_TYPE)
        .map((c) => c.val);

    if (!roles.length) {
        console.warn(`No roles found in JWT for user ${principal.user_id}. Configure app roles in Azure AD.`);
    }

    if (!roles.includes(role)) {
        throw error(403, 'Not authorized');
    }

    return principal;
}