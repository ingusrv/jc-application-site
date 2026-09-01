import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';

export type AppServicePrincipal = {
    user_id: string;
    user_claims: Array<{
        typ: string;
        val: string;
    }>;
};

const ROLE_CLAIM_TYPE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

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

    try {
        const res = await fetch('/.auth/me');

        if (!res.ok) {
            throw error(401, 'Not authenticated');
        }

        const text = await res.text();

        if (!text) {
            throw error(401, 'Not authenticated');
        }

        const principals = JSON.parse(text) as AppServicePrincipal[];
        const principal = principals[0];

        if (!principal) {
            throw error(401, 'Not authenticated');
        }

        const roles = principal.user_claims
            .filter((c) => c.typ === ROLE_CLAIM_TYPE)
            .map((c) => c.val);

        if (!roles.includes(role)) {
            throw error(403, 'Not authorized');
        }

        return principal;
    } catch (err) {
        console.error("Error while fetching /.auth/me:", err);
        throw error(500, 'Internal server error');
    }
}

export function requireAdmin(fetch: typeof globalThis.fetch) {
    return requireRole(fetch, 'admin');
}