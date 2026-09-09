import { EmailClient } from '@azure/communication-email';
import { env } from '$env/dynamic/private';

let emailClient: EmailClient | null = null;

export function getEmailClient(): EmailClient {
    if (emailClient) {
        return emailClient;
    }

    if (!env.ACS_CONNECTION_STRING) {
        throw new Error('ACS_CONNECTION_STRING environment variable is not set');
    }

    emailClient = new EmailClient(env.ACS_CONNECTION_STRING);
    return emailClient;
}