<script lang="ts">
    import * as Table from "$lib/components/ui/table/index";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import { type Club } from "$lib/server/db/schema";
    import { Button, buttonVariants } from "$lib/components/ui/button/index";
    import { Input } from "$lib/components/ui/input/index";
    import { Label } from "$lib/components/ui/label/index";
    import { enhance } from "$app/forms";
    import { Textarea } from "$lib/components/ui/textarea/index";
    import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
    import { X, Trash2 } from "@lucide/svelte";

    let { data }: { data: { clubs: Club[]; errorMessage: string | null } } =
        $props();
    let editingClub = $state<Club | null>(null);
    let dialogOpen = $state(false);

    let formSubmissionError = $state("");
    const handleSubmit = ({ result }: any) => {
        if (result.type === "success" && result.data.success) {
            dialogOpen = false;
            editingClub = null;
            formSubmissionError = "";
        } else {
            formSubmissionError =
                result.data.error ||
                "Kļūda saglabājot datus. Lūdzu, mēģiniet vēlreiz.";
        }
    };
</script>

<svelte:head>
    <title>Pulciņi</title>
</svelte:head>

<div class="flex flex-col h-screen overflow-hidden">
    <div>
        <Button variant="link" href="/pieteikumi">Skatīt pieteikumus</Button>
        <Button
            variant="default"
            onclick={() => {
                editingClub = null;
                dialogOpen = true;
            }}
        >
            Pievienot jaunu pulciņu
        </Button>
    </div>

    <div class="flex-1 min-h-0">
        <Table.Root class="relative" containerClass="h-full">
            <Table.Header class="sticky top-0 z-10 bg-background">
                <Table.Row>
                    <Table.Head>Nosaukums</Table.Head>
                    <Table.Head>Klase</Table.Head>
                    <Table.Head>Vietas</Table.Head>
                    <Table.Head>Nodarbību laiki</Table.Head>
                    <Table.Head>Apraksts</Table.Head>
                    <Table.Head>Pieteikumi</Table.Head>
                    <Table.Head>Darbības</Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each data.clubs as club}
                    <Table.Row>
                        <Table.Cell>{club.name}</Table.Cell>
                        <Table.Cell>
                            {club.minGrade}. - {club.maxGrade}. klase
                        </Table.Cell>
                        <Table.Cell>{club.maxParticipants}</Table.Cell>
                        <Table.Cell>{club.schedule}</Table.Cell>
                        <Table.Cell class="max-w-lg whitespace-normal">
                            {club.description}
                        </Table.Cell>
                        <Table.Cell>
                            {club.isOpen ? "Atvērts" : "Slēgts"}
                        </Table.Cell>
                        <Table.Cell>
                            <span class="flex flex-row gap-2">
                                <Button
                                    variant="secondary"
                                    class="cursor-pointer"
                                    onclick={() => {
                                        editingClub = club;
                                        dialogOpen = true;
                                    }}
                                >
                                    Rediģēt
                                </Button>
                                <form
                                    method="post"
                                    action="?/deleteClub"
                                    use:enhance
                                    onsubmit={(event) => {
                                        if (
                                            !confirm(
                                                "Vai tiešām dzēst šo pulciņu?",
                                            )
                                        ) {
                                            event.preventDefault();
                                        }
                                    }}
                                >
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={club.id}
                                    />
                                    <Button
                                        variant="destructive"
                                        class="cursor-pointer"
                                        type="submit"
                                    >
                                        <Trash2 data-icon="inline-start" />
                                        Dzēst
                                    </Button>
                                </form>
                            </span>
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
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

<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>
                {#if editingClub}Rediģēt pulciņu{:else}Pievienot jaunu pulciņu{/if}
            </Dialog.Title>
            <Dialog.Description>
                Veiciet izmaiņas pulciņa datos un saglabājiet tās.
            </Dialog.Description>
        </Dialog.Header>
        {#if formSubmissionError}
            <div class="text-red-500">{formSubmissionError}</div>
        {/if}
        <form
            method="post"
            action={editingClub ? "?/updateClub" : "?/createClub"}
            use:enhance={({ formElement, formData, action, cancel }) => {
                return async ({ result, update }) => {
                    handleSubmit({ result });
                    await update();
                };
            }}
            class="space-y-4"
        >
            {#if editingClub}
                <input type="hidden" name="id" value={editingClub.id} />
            {/if}

            <div class="space-y-2">
                <Label for="name">Nosaukums</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Pulciņa nosaukums"
                    value={editingClub?.name ?? ""}
                    required
                    maxlength={255}
                />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="minGrade">Minimālā klase</Label>
                    <Input
                        id="minGrade"
                        name="minGrade"
                        type="number"
                        placeholder="1"
                        value={editingClub?.minGrade ?? ""}
                        required
                    />
                </div>
                <div class="space-y-2">
                    <Label for="maxGrade">Maksimālā klase</Label>
                    <Input
                        id="maxGrade"
                        name="maxGrade"
                        type="number"
                        placeholder="12"
                        value={editingClub?.maxGrade ?? ""}
                        required
                    />
                </div>
            </div>

            <div class="space-y-2">
                <Label for="maxParticipants">
                    Maksimālais dalībnieku skaits
                </Label>
                <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    placeholder="30"
                    value={editingClub?.maxParticipants ?? ""}
                    required
                />
            </div>

            <div class="space-y-2">
                <Label for="schedule">Nodarbību laiki</Label>
                <Input
                    id="schedule"
                    name="schedule"
                    placeholder="Piemēram: Pirmdiena 15:00-16:00"
                    value={editingClub?.schedule ?? ""}
                    required
                    maxlength={255}
                />
            </div>

            <div class="space-y-2">
                <Label for="description">Apraksts</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Pulciņa apraksts"
                    value={editingClub?.description ?? ""}
                    maxlength={1000}
                    class="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>
            <div class="flex items-center gap-3">
                <Checkbox
                    id="isOpen"
                    name="isOpen"
                    checked={editingClub?.isOpen ?? false}
                />
                <Label for="isOpen">Atvērts pieteikumiem</Label>
            </div>
            <Button type="submit" class="ml-auto block">Saglabāt</Button>
        </form>
        <Dialog.Footer>
            <Dialog.Close
                type="button"
                class={buttonVariants({ variant: "outline" })}
                onclick={() => {
                    dialogOpen = false;
                }}
            >
                Atcelt
            </Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
