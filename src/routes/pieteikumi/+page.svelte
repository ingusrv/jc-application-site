<script lang="ts">
    import { type ApplicationWithClub } from "./+page.server";
    import * as Table from "$lib/components/ui/table/index";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import { Button, buttonVariants } from "$lib/components/ui/button/index";
    import { Input } from "$lib/components/ui/input/index";
    import { Label } from "$lib/components/ui/label/index";
    import { enhance } from "$app/forms";
    import { X, ChevronDown, ChevronUp, Pencil, Eye } from "@lucide/svelte";

    let {
        data,
    }: {
        data: {
            applications: ApplicationWithClub[];
            errorMessage: string | null;
        };
    } = $props();

    let viewingApplication = $state<ApplicationWithClub | null>(null);
    let viewDialogOpen = $state(false);
    let editingApplication = $state<ApplicationWithClub | null>(null);
    let editDialogOpen = $state(false);
    let formSubmissionError = $state("");
    let expandedClubIds = $state<Record<number, boolean>>({});

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
                applications: [application],
            });
        }

        return [...groups.values()].sort((a, b) =>
            a.clubName.localeCompare(b.clubName),
        );
    });

    function toggleClub(clubId: number): void {
        expandedClubIds[clubId] = !(expandedClubIds[clubId] ?? false);
    }

    function displayValue(value: string | null | undefined): string {
        return value && value.trim() ? value : "nav norādīts";
    }

    function isNullOrEmpty(value: string | null | undefined): boolean {
        return !value || !value.toString().trim();
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
    </div>

    <div class="grid grid-cols-2 gap-4 md:grid-cols-2 max-w-xl">
        <div class="rounded-xl border bg-card p-4 shadow-sm">
            <p class="text-sm text-muted-foreground">Kopā pieteikumi</p>
            <p class="text-3xl font-bold">{data.applications.length}</p>
        </div>
        <div class="rounded-xl border bg-card p-4 shadow-sm">
            <p class="text-sm text-muted-foreground">Kopā pulciņi</p>
            <p class="text-3xl font-bold">{clubGroups.length}</p>
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
                            <h2 class="text-3xl font-bold tracking-tight">
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
                                <Table.Head>Statuss</Table.Head>
                                <Table.Head>Darbības</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each clubGroup.applications as application, index}
                                <Table.Row>
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
                                        {application.status}
                                    </Table.Cell>
                                    <Table.Cell class="flex flex-row gap-2">
                                        <Button
                                            variant="secondary"
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
                                            onclick={() => {
                                                editingApplication =
                                                    application;
                                                formSubmissionError = "";
                                                editDialogOpen = true;
                                            }}
                                        >
                                            <Pencil data-icon="inline-start" />
                                            Rediģēt
                                        </Button>
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
    <Dialog.Content class="max-h-[90vh] max-w-4xl overflow-y-auto">
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
                class="flex flex-col gap-4"
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
                    <Label for="edit-educationalInstitution"
                        >Izglītības iestāde</Label
                    >
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
                            <Label for="edit-primaryGuardianFirstName"
                                >Vārds</Label
                            >
                            <Input
                                id="edit-primaryGuardianFirstName"
                                name="primaryGuardianFirstName"
                                value={editingApplication.primaryGuardianFirstName}
                                required
                                maxlength={100}
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <Label for="edit-primaryGuardianLastName"
                                >Uzvārds</Label
                            >
                            <Input
                                id="edit-primaryGuardianLastName"
                                name="primaryGuardianLastName"
                                value={editingApplication.primaryGuardianLastName}
                                required
                                maxlength={100}
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <Label for="edit-primaryGuardianEmail"
                                >E-pasts</Label
                            >
                            <Input
                                id="edit-primaryGuardianEmail"
                                name="primaryGuardianEmail"
                                type="email"
                                value={editingApplication.primaryGuardianEmail ??
                                    ""}
                                maxlength={255}
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <Label for="edit-primaryGuardianPhone"
                                >Tālrunis</Label
                            >
                            <Input
                                id="edit-primaryGuardianPhone"
                                name="primaryGuardianPhone"
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
                            <Label for="edit-secondaryGuardianFirstName"
                                >Vārds</Label
                            >
                            <Input
                                id="edit-secondaryGuardianFirstName"
                                name="secondaryGuardianFirstName"
                                value={editingApplication.secondaryGuardianFirstName ??
                                    ""}
                                maxlength={100}
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <Label for="edit-secondaryGuardianLastName"
                                >Uzvārds</Label
                            >
                            <Input
                                id="edit-secondaryGuardianLastName"
                                name="secondaryGuardianLastName"
                                value={editingApplication.secondaryGuardianLastName ??
                                    ""}
                                maxlength={100}
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <Label for="edit-secondaryGuardianEmail"
                                >E-pasts</Label
                            >
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
                            <Label for="edit-secondaryGuardianPhone"
                                >Tālrunis</Label
                            >
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
