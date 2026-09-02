<script lang="ts">
    import { type Application } from "$lib/server/db/schema";
    import { type ApplicationWithClub } from "./+page.server";
    import * as Table from "$lib/components/ui/table/index";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import { Button, buttonVariants } from "$lib/components/ui/button/index";
    import { X } from "@lucide/svelte";

    let {
        data,
    }: {
        data: {
            applications: ApplicationWithClub[];
            errorMessage: string | null;
        };
    } = $props();

    let editingApplication = $state<Application | null>(null);
    let dialogOpen = $state(false);
    let viewingApplication = $state<ApplicationWithClub | null>(null);
    let viewDialogOpen = $state(false);

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

<Button variant="link" href="/">Sākumlapa</Button>
<Button variant="link" href="/.auth/logout">Iziet</Button>
<Button variant="link" href="/pulcini">Rediģēt pulciņus</Button>

<Table.Root>
    <Table.Caption>Pieteikumu tabula</Table.Caption>
    <Table.Header>
        <Table.Row>
            <Table.Head>Vārds</Table.Head>
            <Table.Head>Uzvārds</Table.Head>
            <Table.Head>Pulciņš</Table.Head>
            <Table.Head>Nodarbību laiks</Table.Head>
            <Table.Head>Personas kods</Table.Head>
            <Table.Head>Adrese</Table.Head>
            <Table.Head>Izglītības iestāde</Table.Head>
            <Table.Head>Klase</Table.Head>
            <Table.Head>Pirmā vecāka vārds</Table.Head>
            <Table.Head>Pirmā vecāka uzvārds</Table.Head>
            <Table.Head>Pirmā vecāka epasts</Table.Head>
            <Table.Head>Pirmā vecāka tālrunis</Table.Head>
            <Table.Head>Prioritāte</Table.Head>
            <Table.Head>Statuss</Table.Head>
            <Table.Head>Darbības</Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each data.applications as application}
            <Table.Row>
                <Table.Cell>{application.firstName}</Table.Cell>
                <Table.Cell>
                    {application.lastName}
                </Table.Cell>
                <Table.Cell>{application.clubName}</Table.Cell>
                <Table.Cell>{application.clubSchedule}</Table.Cell>
                <Table.Cell>{application.personCode}</Table.Cell>
                <Table.Cell>{application.address}</Table.Cell>
                <Table.Cell>{application.educationalInstitution}</Table.Cell>
                <Table.Cell>{application.grade}</Table.Cell>
                <Table.Cell>{application.primaryGuardianFirstName}</Table.Cell>
                <Table.Cell>{application.primaryGuardianLastName}</Table.Cell>
                <Table.Cell>{application.primaryGuardianEmail}</Table.Cell>
                <Table.Cell>{application.primaryGuardianPhone}</Table.Cell>
                <Table.Cell>{application.priority}</Table.Cell>
                <Table.Cell>{application.status}</Table.Cell>
                <Table.Cell>
                    <div class="flex gap-2">
                        <Button
                            variant="secondary"
                            onclick={() => {
                                viewingApplication = application;
                                viewDialogOpen = true;
                            }}>Skatīt</Button
                        >
                    </div>
                </Table.Cell>
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Root>

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
