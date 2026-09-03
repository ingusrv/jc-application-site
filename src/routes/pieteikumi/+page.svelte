<script lang="ts">
    import { type ApplicationWithClub, type ClubOption } from "./+page.server";
    import * as Table from "$lib/components/ui/table/index";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import { Button, buttonVariants } from "$lib/components/ui/button/index";
    import { Input } from "$lib/components/ui/input/index";
    import { Label } from "$lib/components/ui/label/index";
    import * as Select from "$lib/components/ui/select/index";
    import { cn } from "$lib/utils";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import {
        X,
        ChevronDown,
        ChevronUp,
        Pencil,
        Eye,
        Trash2,
        RefreshCw,
    } from "@lucide/svelte";

    let {
        data,
    }: {
        data: {
            applications: ApplicationWithClub[];
            clubs: ClubOption[];
            errorMessage: string | null;
        };
    } = $props();

    let viewingApplication = $state<ApplicationWithClub | null>(null);
    let viewDialogOpen = $state(false);
    let editingApplication = $state<ApplicationWithClub | null>(null);
    let editDialogOpen = $state(false);
    let formSubmissionError = $state("");
    let recalculationMessage = $state("");
    let expandedClubIds = $state<Record<number, boolean>>({});
    let selectedClubId = $state("");

    const selectedClub = $derived(
        data.clubs.find((club) => club.id.toString() === selectedClubId),
    );

    function handleEditSubmit({ result }: any): void {
        if (result.type === "success" && result.data.success) {
            editDialogOpen = false;
            editingApplication = null;
            formSubmissionError = "";
        } else {
            formSubmissionError =
                result.data?.error ||
                "Kļūda saglabājot datus. Lūdzu, mēģiniet vēlreiz.";
        }
    }

    const clubGroups = $derived.by(() => {
        const groups = new Map<
            number,
            {
                clubId: number;
                clubName: string;
                clubSchedule: string;
                clubMaxParticipants: number;
                clubDeleted: boolean;
                applications: ApplicationWithClub[];
            }
        >();

        for (const application of data.applications) {
            const existing = groups.get(application.clubId);

            if (existing) {
                existing.applications.push(application);
                continue;
            }

            groups.set(application.clubId, {
                clubId: application.clubId,
                clubName: application.clubName,
                clubSchedule: application.clubSchedule,
                clubMaxParticipants: application.clubMaxParticipants,
                clubDeleted: application.clubDeleted,
                applications: [application],
            });
        }

        return [...groups.values()].sort((a, b) => {
            if (a.clubDeleted !== b.clubDeleted) {
                return Number(a.clubDeleted) - Number(b.clubDeleted);
            }

            return a.clubName.localeCompare(b.clubName);
        });
    });

    const duplicateApplicationKeys = $derived.by(() => {
        const applicationCounts = new Map<string, number>();

        for (const application of data.applications) {
            const personCode = application.personCode.trim();

            if (!personCode) {
                continue;
            }

            const key = `${personCode}:${application.clubId}`;
            applicationCounts.set(key, (applicationCounts.get(key) ?? 0) + 1);
        }

        return new Set(
            [...applicationCounts.entries()]
                .filter(([, count]) => count > 1)
                .map(([key]) => key),
        );
    });

    function isDuplicateApplication(application: ApplicationWithClub): boolean {
        const personCode = application.personCode.trim();
        return (
            personCode.length > 0 &&
            duplicateApplicationKeys.has(`${personCode}:${application.clubId}`)
        );
    }

    function toggleClub(clubId: number): void {
        expandedClubIds[clubId] = !(expandedClubIds[clubId] ?? false);
    }

    function displayValue(value: string | null | undefined): string {
        return value && value.trim() ? value : "nav norādīts";
    }

    function isNullOrEmpty(value: string | null | undefined): boolean {
        return !value || !value.toString().trim();
    }

    function handleRecalculateSubmit({ result }: any): void {
        if (result.type === "success" && result.data.success) {
            recalculationMessage = `Prioritātes pārrēķinātas. Pārbaudīti pieteikumi: ${result.data.checkedCount}, Mainīta prioritāte: ${result.data.changedCount}`;
        } else {
            recalculationMessage =
                result.data?.error || "Prioritātes neizdevās pārrēķināt.";
        }
    }
</script>

<svelte:head>
    <title>Pieteikumi</title>
</svelte:head>

<div class="space-y-6 p-4">
    <div>
        <Button variant="link" href="/">Sākumlapa</Button>
        <Button variant="link" href="/.auth/logout">Iziet</Button>
        <Button variant="link" href="/pulcini">Rediģēt pulciņus</Button>
        <form
            method="post"
            action="?/recalculatePriorities"
            use:enhance={() => {
                if (
                    !confirm(
                        "Šī funkcija ir neatgriezeniska! Vai tiešām pārrēķināt prioritātes? Pozitīvās prioritātes netiks mainītas. Neskaidrību gadījumā sazinieties ar sistēmas administratoru.",
                    )
                ) {
                    return;
                }

                return async ({ result, update }) => {
                    const succeeded =
                        result.type === "success" && !!result.data?.success;
                    handleRecalculateSubmit({ result });
                    await update();
                    if (succeeded) {
                        await invalidateAll();
                    }
                };
            }}
            class="inline"
        >
            <Button type="submit" variant="outline" class="cursor-pointer">
                <RefreshCw data-icon="inline-start" />
                Pārrēķināt prioritātes
            </Button>
        </form>
        {#if recalculationMessage}
            <p class="mt-2 text-sm text-muted-foreground" role="status">
                {recalculationMessage}
            </p>
        {/if}
    </div>

    <div class="grid grid-cols-2 gap-4 md:grid-cols-2 max-w-xl">
        <div class="rounded-xl border bg-card p-4 shadow-sm">
            <p class="text-sm text-muted-foreground">Kopā pieteikumi</p>
            <p class="text-3xl font-bold">{data.applications.length}</p>
        </div>
        <div class="rounded-xl border bg-card p-4 shadow-sm">
            <p class="text-sm text-muted-foreground">Kopā pulciņi</p>
            <p class="text-3xl font-bold">{data.clubs.length}</p>
        </div>
    </div>

    <!-- <div class="flex-1 min-h-0 space-y-6 overflow-y-auto p-4"> -->
    {#if clubGroups.length === 0}
        <div
            class="rounded-xl border bg-card p-6 text-lg font-medium text-muted-foreground"
        >
            Nav pieteikumu.
        </div>
    {:else}
        {#each clubGroups as clubGroup (clubGroup.clubId)}
            <section class="rounded-xl border bg-card p-4 shadow-sm">
                <div class="mb-4 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <button
                            class="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background text-lg font-semibold"
                            aria-label={expandedClubIds[clubGroup.clubId] ===
                            true
                                ? `Aizvērt ${clubGroup.clubName}`
                                : `Atvērt ${clubGroup.clubName}`}
                            onclick={() => toggleClub(clubGroup.clubId)}
                        >
                            {#if expandedClubIds[clubGroup.clubId] === true}
                                <ChevronUp />
                            {:else}
                                <ChevronDown />
                            {/if}
                        </button>

                        <div class="flex flex-wrap items-baseline gap-3">
                            {#if clubGroup.clubDeleted}
                                <span class="text-2xl font-bold text-red-600">
                                    IZDZĒSTS
                                </span>
                            {/if}
                            <h2 class="text-2xl font-bold tracking-tight">
                                {clubGroup.clubName}
                            </h2>
                            <p class="text-lg text-muted-foreground">
                                {clubGroup.clubSchedule}
                            </p>
                        </div>
                    </div>

                    <p class="text-base font-semibold whitespace-nowrap">
                        Pieteikumi: {clubGroup.applications.length} / {clubGroup.clubMaxParticipants}
                    </p>
                </div>

                {#if expandedClubIds[clubGroup.clubId] === true}
                    <Table.Root class="relative" containerClass="max-h-[40rem]">
                        <Table.Header class="sticky top-0 z-10 bg-background">
                            <Table.Row>
                                <Table.Head>Nr</Table.Head>
                                <Table.Head>Vārds</Table.Head>
                                <Table.Head>Uzvārds</Table.Head>
                                <Table.Head>Personas kods</Table.Head>
                                <Table.Head>Izglītības iestāde</Table.Head>
                                <Table.Head>Klase</Table.Head>
                                <Table.Head>Prioritāte</Table.Head>
                                <Table.Head>Izveides datums</Table.Head>
                                <Table.Head>Statuss</Table.Head>
                                <Table.Head>Darbības</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each clubGroup.applications as application, index}
                                <Table.Row
                                    class={cn(
                                        isDuplicateApplication(application) &&
                                            "bg-yellow-100 hover:bg-yellow-200",
                                    )}
                                >
                                    <Table.Cell>{index + 1}</Table.Cell>
                                    <Table.Cell>
                                        {application.firstName}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {application.lastName}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {application.personCode}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {application.educationalInstitution}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {application.grade}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {application.priority}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {application.createdAt.toLocaleString(
                                            "lv-LV",
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {application.status}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span class="flex flex-row gap-2">
                                            <Button
                                                variant="secondary"
                                                class="cursor-pointer"
                                                onclick={() => {
                                                    viewingApplication =
                                                        application;
                                                    viewDialogOpen = true;
                                                }}
                                            >
                                                <Eye data-icon="inline-start" />
                                                Skatīt
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                class="cursor-pointer"
                                                onclick={() => {
                                                    editingApplication =
                                                        application;
                                                    selectedClubId =
                                                        application.clubId.toString();
                                                    formSubmissionError = "";
                                                    editDialogOpen = true;
                                                }}
                                            >
                                                <Pencil
                                                    data-icon="inline-start"
                                                />
                                                Rediģēt
                                            </Button>
                                            <form
                                                method="post"
                                                action="?/deleteApplication"
                                                use:enhance
                                                onsubmit={(event) => {
                                                    if (
                                                        !confirm(
                                                            "Vai tiešām dzēst šo pieteikumu?",
                                                        )
                                                    ) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="hidden"
                                                    name="id"
                                                    value={application.id}
                                                />
                                                <Button
                                                    variant="destructive"
                                                    class="cursor-pointer"
                                                    type="submit"
                                                >
                                                    <Trash2
                                                        data-icon="inline-start"
                                                    />
                                                    Dzēst
                                                </Button>
                                            </form>
                                        </span>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                {/if}
            </section>
        {/each}
    {/if}
    <!-- </div> -->
</div>

{#if data.errorMessage}
    <div
        class="rounded-xl border border-destructive/30 bg-destructive/10 p-4 col-span-full flex items-center gap-3 shadow-xs"
        role="alert"
    >
        <X class="size-5 shrink-0 text-destructive" />
        <p class="text-sm font-medium text-destructive">
            {data.errorMessage}
        </p>
    </div>
{/if}

<Dialog.Root bind:open={viewDialogOpen}>
    <Dialog.Content class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <Dialog.Header>
            <Dialog.Title>Pieteikuma dati</Dialog.Title>
            <Dialog.Description>
                Pilna informācija par pieteikumu
            </Dialog.Description>
        </Dialog.Header>
        {#if viewingApplication}
            <div class="space-y-6">
                <div>
                    <h3 class="font-semibold text-lg mb-4">
                        Personīgā informācija
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Vārds
                            </p>
                            <p>{viewingApplication.firstName}</p>
                        </div>
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Uzvārds
                            </p>
                            <p>{viewingApplication.lastName}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Personas kods
                            </p>
                            <p>{viewingApplication.personCode}</p>
                        </div>
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Pulciņš
                            </p>
                            <p>{viewingApplication.clubName}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                E-pasts
                            </p>
                            <p
                                class={isNullOrEmpty(viewingApplication.email)
                                    ? "text-red-500"
                                    : ""}
                            >
                                {displayValue(viewingApplication.email)}
                            </p>
                        </div>
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Tālrunis
                            </p>
                            <p
                                class={isNullOrEmpty(viewingApplication.phone)
                                    ? "text-red-500"
                                    : ""}
                            >
                                {displayValue(viewingApplication.phone)}
                            </p>
                        </div>
                    </div>

                    <div class="mt-4">
                        <p class="font-semibold text-sm text-muted-foreground">
                            Adrese
                        </p>
                        <p>{viewingApplication.address}</p>
                    </div>
                </div>

                <div class="border-t pt-4">
                    <h3 class="font-semibold text-lg mb-4">
                        Izglītības informācija
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Izglītības iestāde
                            </p>
                            <p>{viewingApplication.educationalInstitution}</p>
                        </div>
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Klase
                            </p>
                            <p>{viewingApplication.grade}</p>
                        </div>
                    </div>
                </div>

                <div class="border-t pt-4">
                    <h3 class="font-semibold text-lg mb-4">
                        Pirmā vecāka dati
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Vārds
                            </p>
                            <p>{viewingApplication.primaryGuardianFirstName}</p>
                        </div>
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Uzvārds
                            </p>
                            <p>{viewingApplication.primaryGuardianLastName}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                E-pasts
                            </p>
                            <p
                                class={isNullOrEmpty(
                                    viewingApplication.primaryGuardianEmail,
                                )
                                    ? "text-red-500"
                                    : ""}
                            >
                                {displayValue(
                                    viewingApplication.primaryGuardianEmail,
                                )}
                            </p>
                        </div>
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Tālrunis
                            </p>
                            <p
                                class={isNullOrEmpty(
                                    viewingApplication.primaryGuardianPhone,
                                )
                                    ? "text-red-500"
                                    : ""}
                            >
                                {displayValue(
                                    viewingApplication.primaryGuardianPhone,
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="border-t pt-4">
                    <h3 class="font-semibold text-lg mb-4">Otrā vecāka dati</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Vārds
                            </p>
                            <p
                                class={isNullOrEmpty(
                                    viewingApplication.secondaryGuardianFirstName,
                                )
                                    ? "text-red-500"
                                    : ""}
                            >
                                {displayValue(
                                    viewingApplication.secondaryGuardianFirstName,
                                )}
                            </p>
                        </div>
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Uzvārds
                            </p>
                            <p
                                class={isNullOrEmpty(
                                    viewingApplication.secondaryGuardianLastName,
                                )
                                    ? "text-red-500"
                                    : ""}
                            >
                                {displayValue(
                                    viewingApplication.secondaryGuardianLastName,
                                )}
                            </p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                E-pasts
                            </p>
                            <p
                                class={isNullOrEmpty(
                                    viewingApplication.secondaryGuardianEmail,
                                )
                                    ? "text-red-500"
                                    : ""}
                            >
                                {displayValue(
                                    viewingApplication.secondaryGuardianEmail,
                                )}
                            </p>
                        </div>
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Tālrunis
                            </p>
                            <p
                                class={isNullOrEmpty(
                                    viewingApplication.secondaryGuardianPhone,
                                )
                                    ? "text-red-500"
                                    : ""}
                            >
                                {displayValue(
                                    viewingApplication.secondaryGuardianPhone,
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="border-t pt-4">
                    <h3 class="font-semibold text-lg mb-4">
                        Papildu informācija
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                ID
                            </p>
                            <p>{viewingApplication.id}</p>
                        </div>
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Statuss
                            </p>
                            <p>{viewingApplication.status}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Prioritāte
                            </p>
                            <p>{viewingApplication.priority}</p>
                        </div>
                        <div>
                            <p
                                class="font-semibold text-sm text-muted-foreground"
                            >
                                Pieteikuma datums
                            </p>
                            <p>
                                {new Date(
                                    viewingApplication.createdAt,
                                ).toLocaleString("lv-LV")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
        <Dialog.Footer>
            <Dialog.Close
                type="button"
                class={buttonVariants({ variant: "outline" })}
                onclick={() => {
                    viewDialogOpen = false;
                }}
            >
                Aizvērt
            </Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editDialogOpen}>
    <Dialog.Content
        class="max-h-[90vh] max-w-4xl overflow-y-auto flex flex-col"
    >
        <Dialog.Header>
            <Dialog.Title>Rediģēt pieteikumu</Dialog.Title>
            <Dialog.Description>
                Veiciet izmaiņas pieteikuma datos un saglabājiet tās.
            </Dialog.Description>
        </Dialog.Header>

        {#if formSubmissionError}
            <div class="text-red-500" role="alert">{formSubmissionError}</div>
        {/if}

        {#if editingApplication}
            <form
                method="post"
                action="?/updateApplication"
                use:enhance={() => {
                    return async ({ result, update }) => {
                        handleEditSubmit({ result });
                        await update();
                    };
                }}
                class="flex flex-col gap-4 w-full"
            >
                <input type="hidden" name="id" value={editingApplication.id} />

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <Label for="edit-firstName">Vārds</Label>
                        <Input
                            id="edit-firstName"
                            name="firstName"
                            value={editingApplication.firstName}
                            required
                            maxlength={100}
                        />
                    </div>
                    <div class="flex flex-col gap-2">
                        <Label for="edit-lastName">Uzvārds</Label>
                        <Input
                            id="edit-lastName"
                            name="lastName"
                            value={editingApplication.lastName}
                            required
                            maxlength={100}
                        />
                    </div>
                    <div class="flex flex-col gap-2">
                        <Label for="edit-personCode">Personas kods</Label>
                        <Input
                            id="edit-personCode"
                            name="personCode"
                            value={editingApplication.personCode}
                            required
                            maxlength={12}
                        />
                    </div>
                    <div class="flex flex-col gap-2">
                        <Label for="edit-grade">Klase</Label>
                        <Input
                            id="edit-grade"
                            name="grade"
                            type="number"
                            min="1"
                            max="12"
                            value={editingApplication.grade}
                            required
                        />
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <Label for="edit-clubId">Pulciņš</Label>
                    <Select.Root
                        type="single"
                        name="clubId"
                        required
                        bind:value={selectedClubId}
                    >
                        <Select.Trigger
                            id="edit-clubId"
                            class="flex flex-row w-full"
                        >
                            <span
                                class="overflow-hidden text-ellipsis w-full text-left"
                            >
                                {selectedClub?.name ??
                                    editingApplication.clubName}
                                {selectedClub?.schedule ??
                                    editingApplication.clubSchedule}
                            </span>
                        </Select.Trigger>
                        <Select.Content class="max-h-96">
                            <Select.Group>
                                {#each data.clubs as club (club.id)}
                                    <Select.Item value={club.id.toString()}>
                                        {club.name} - {club.schedule}
                                    </Select.Item>
                                {/each}
                            </Select.Group>
                        </Select.Content>
                    </Select.Root>
                </div>

                <div class="flex flex-col gap-2">
                    <Label for="edit-address">Adrese</Label>
                    <Input
                        id="edit-address"
                        name="address"
                        value={editingApplication.address}
                        required
                        maxlength={255}
                    />
                </div>
                <div class="flex flex-col gap-2">
                    <Label for="edit-educationalInstitution">
                        Izglītības iestāde
                    </Label>
                    <Input
                        id="edit-educationalInstitution"
                        name="educationalInstitution"
                        value={editingApplication.educationalInstitution}
                        required
                        maxlength={255}
                    />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <Label for="edit-email">E-pasts</Label>
                        <Input
                            id="edit-email"
                            name="email"
                            type="email"
                            value={editingApplication.email ?? ""}
                            maxlength={255}
                        />
                    </div>
                    <div class="flex flex-col gap-2">
                        <Label for="edit-phone">Tālrunis</Label>
                        <Input
                            id="edit-phone"
                            name="phone"
                            value={editingApplication.phone ?? ""}
                            maxlength={20}
                        />
                    </div>
                </div>

                <div class="border-t pt-4">
                    <h3 class="mb-4 text-lg font-semibold">
                        Pirmā vecāka dati
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <Label for="edit-primaryGuardianFirstName">
                                Vārds
                            </Label>
                            <Input
                                id="edit-primaryGuardianFirstName"
                                name="primaryGuardianFirstName"
                                value={editingApplication.primaryGuardianFirstName}
                                required
                                maxlength={100}
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <Label for="edit-primaryGuardianLastName">
                                Uzvārds
                            </Label>
                            <Input
                                id="edit-primaryGuardianLastName"
                                name="primaryGuardianLastName"
                                value={editingApplication.primaryGuardianLastName}
                                required
                                maxlength={100}
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <Label for="edit-primaryGuardianEmail">
                                E-pasts
                            </Label>
                            <Input
                                id="edit-primaryGuardianEmail"
                                name="primaryGuardianEmail"
                                type="email"
                                required
                                value={editingApplication.primaryGuardianEmail ??
                                    ""}
                                maxlength={255}
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <Label for="edit-primaryGuardianPhone">
                                Tālrunis
                            </Label>
                            <Input
                                id="edit-primaryGuardianPhone"
                                name="primaryGuardianPhone"
                                required
                                value={editingApplication.primaryGuardianPhone ??
                                    ""}
                                maxlength={20}
                            />
                        </div>
                    </div>
                </div>

                <div class="border-t pt-4">
                    <h3 class="mb-4 text-lg font-semibold">Otrā vecāka dati</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <Label for="edit-secondaryGuardianFirstName">
                                Vārds
                            </Label>
                            <Input
                                id="edit-secondaryGuardianFirstName"
                                name="secondaryGuardianFirstName"
                                value={editingApplication.secondaryGuardianFirstName ??
                                    ""}
                                maxlength={100}
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <Label for="edit-secondaryGuardianLastName">
                                Uzvārds
                            </Label>
                            <Input
                                id="edit-secondaryGuardianLastName"
                                name="secondaryGuardianLastName"
                                value={editingApplication.secondaryGuardianLastName ??
                                    ""}
                                maxlength={100}
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <Label for="edit-secondaryGuardianEmail">
                                E-pasts
                            </Label>
                            <Input
                                id="edit-secondaryGuardianEmail"
                                name="secondaryGuardianEmail"
                                type="email"
                                value={editingApplication.secondaryGuardianEmail ??
                                    ""}
                                maxlength={255}
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <Label for="edit-secondaryGuardianPhone">
                                Tālrunis
                            </Label>
                            <Input
                                id="edit-secondaryGuardianPhone"
                                name="secondaryGuardianPhone"
                                value={editingApplication.secondaryGuardianPhone ??
                                    ""}
                                maxlength={20}
                            />
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <Label for="edit-status">Statuss</Label>
                        <Input
                            id="edit-status"
                            name="status"
                            value={editingApplication.status}
                            required
                            maxlength={50}
                        />
                    </div>
                    <div class="flex flex-col gap-2">
                        <Label for="edit-priority">Prioritāte</Label>
                        <Input
                            id="edit-priority"
                            name="priority"
                            type="number"
                            value={editingApplication.priority}
                            required
                        />
                    </div>
                </div>

                <Button type="submit" class="ml-auto">Saglabāt</Button>
            </form>
        {/if}

        <Dialog.Footer>
            <Dialog.Close
                type="button"
                class={buttonVariants({ variant: "outline" })}
                onclick={() => {
                    editDialogOpen = false;
                }}
            >
                Atcelt
            </Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
