<script lang="ts">
    import * as Table from "$lib/components/ui/table/index";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import type { ClientPrincipal } from "svelte-adapter-azure-swa";
    import { type Club } from "$lib/server/db/schema";
    import { Button, buttonVariants } from "$lib/components/ui/button/index";
    import { Input } from "$lib/components/ui/input/index";
    import { Label } from "$lib/components/ui/label/index";
    import { enhance } from "$app/forms";
    import { Textarea } from "$lib/components/ui/textarea/index";

    let { data }: { data: { clubs: Club[] } } = $props();
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

<Button variant="link" href="/pieteikumi">Skatīt pieteikumus</Button>
<Button
    variant="default"
    onclick={() => {
        editingClub = null;
        dialogOpen = true;
    }}>Pievienot jaunu pulciņu</Button
>

<Table.Root>
    <Table.Caption>Pulciņu tabula</Table.Caption>
    <Table.Header>
        <Table.Row>
            <Table.Head>Nosaukums</Table.Head>
            <Table.Head>Klase</Table.Head>
            <Table.Head>Vietas</Table.Head>
            <Table.Head>Nodarbību laiki</Table.Head>
            <Table.Head>Apraksts</Table.Head>
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
                <Table.Cell class="max-w-lg whitespace-normal"
                    >{club.description}</Table.Cell
                >
                <Table.Cell>
                    <Button
                        variant="secondary"
                        onclick={() => {
                            editingClub = club;
                            dialogOpen = true;
                        }}>Rediģēt</Button
                    >
                </Table.Cell>
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Root>

<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title
                >{#if editingClub}Rediģēt pulciņu{:else}Pievienot jaunu pulciņu{/if}</Dialog.Title
            >
            <Dialog.Description>
                Make changes to your profile here. Click save when you&apos;re
                done.
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
            {#if editingClub}<input
                    type="hidden"
                    name="id"
                    value={editingClub.id}
                />{/if}

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
                    <Label for="minClass">Minimālā klase</Label>
                    <Input
                        id="minClass"
                        name="minClass"
                        type="number"
                        placeholder="1"
                        value={editingClub?.minGrade ?? ""}
                        required
                    />
                </div>
                <div class="space-y-2">
                    <Label for="maxClass">Maksimālā klase</Label>
                    <Input
                        id="maxClass"
                        name="maxClass"
                        type="number"
                        placeholder="12"
                        value={editingClub?.maxGrade ?? ""}
                        required
                    />
                </div>
            </div>

            <div class="space-y-2">
                <Label for="maxParticipants"
                    >Maksimālais dalībnieku skaits</Label
                >
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
