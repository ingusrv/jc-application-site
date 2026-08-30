import { PUBLIC_SWA_AUTH } from '$env/static/public';
import { error } from '@sveltejs/kit';

export type ClientPrincipal = {
    userId: string;
    userRoles?: string[];
    userDetails?: string;
    identityProvider?: string;
};

export async function requireRole(
    fetch: typeof globalThis.fetch,
    role: string
) {
    if (PUBLIC_SWA_AUTH === 'false') {
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

    const { clientPrincipal }: { clientPrincipal: ClientPrincipal } =
        JSON.parse(text);

    if (!clientPrincipal.userRoles?.includes(role)) {
        throw error(403, 'Not authorized');
    }

    return clientPrincipal;
}

export function requireAdmin(fetch: typeof globalThis.fetch) {
    return requireRole(fetch, 'admin');
}