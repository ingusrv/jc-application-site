export enum ApplicationStatus {
    Processing = "apstrādē",
    Approved = "apstiprināts",
    WaitingList = "gaidīšanas rindā",
    Rejected = "noraidīts",
}

export function isApplicationStatus(
    value: string,
): value is ApplicationStatus {
    return Object.values(ApplicationStatus).includes(
        value as ApplicationStatus,
    );
}