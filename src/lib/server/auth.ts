import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';

export type ClientPrincipal = {
    userId: string;
    userRoles?: string[];
    userDetails?: string;
    identityProvider?: string;
};

function isAppServiceAuthEnabled() {
    return env.PUBLIC_ENABLE_AUTH === 'true';
}

export async function requireRole(
    fetch: typeof globalThis.fetch,
    role: string
) {
    if (!isAppServiceAuthEnabled()) {
        return;
    }

    const res = await fetch('/.auth/me');

    if (!res.ok) {
        throw error(401, 'Not authenticated');
    }

    const text = await res.text();

    if (!text) {
        throw error(401, 'Not authenticated');
    }

    const payload = JSON.parse(text) as { clientPrincipal?: ClientPrincipal };
    const clientPrincipal = payload.clientPrincipal;

    if (!clientPrincipal?.userRoles?.includes(role)) {
        throw error(403, 'Not authorized');
    }

    return clientPrincipal;
}

export function requireAdmin(fetch: typeof globalThis.fetch) {
    return requireRole(fetch, 'admin');
}