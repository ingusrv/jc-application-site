<script lang="ts">
    import type { PageData } from "./$types";
    import * as Form from "$lib/components/ui/form/index";
    import { Input } from "$lib/components/ui/input/index";
    import { Button, buttonVariants } from "$lib/components/ui/button/index";
    import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
    import { Label } from "$lib/components/ui/label/index";
    import * as Card from "$lib/components/ui/card/index";
    import * as Collapsible from "$lib/components/ui/collapsible/index";
    import { Separator } from "$lib/components/ui/separator/index";
    import {
        applicationFormSchema,
        type ApplicationFormSchema,
    } from "./schema";
    import {
        superForm,
        type SuperValidated,
        type Infer,
    } from "sveltekit-superforms";
    import { zod4Client } from "sveltekit-superforms/adapters";
    import {
        User,
        Users,
        GraduationCap,
        CircleCheck,
        CircleAlert,
        LoaderCircle,
        Send,
        Copyright,
        Check,
        ChevronDown,
    } from "@lucide/svelte";
    import { untrack } from "svelte";
    import type { ClubWithApplicationCount } from "./+page.server";
    import { authRedirectUri } from "$lib/authUri";

    let {
        data,
    }: {
        data: { form: SuperValidated<any>; clubs: ClubWithApplicationCount[] };
    } = $props();

    const form = superForm(
        untrack(() => data.form),
        {
            dataType: "json",
            validators: zod4Client(applicationFormSchema),
            onResult: ({ result }) => {
                if (result.type === "success") {
                    document.getElementById("form-title")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                    document.getElementById("form-title")?.focus();
                }
            },
        },
    );

    const { form: formData, enhance, delayed, message, allErrors } = form;

    let processingAgreement = $state(false);
    let rulesAgreement = $state(false);
    let selectedClubId = $state<number>(0);
    $effect(() => {
        $formData.clubId = selectedClubId;
    });
</script>

<svelte:head>
    <title>Pieteikuma anketa JC pulciņiem</title>
</svelte:head>

<main class="bg-background">
    <div class="mx-auto max-w-3xl space-y-8">
        <!-- Header / Hero -->
        <header class="text-center space-y-3 pt-8">
            <h1
                id="form-title"
                class="text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
                Dalībnieka pieteikuma anketa
            </h1>
            <p
                class="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto"
            >
                Aizpildiet zemāk esošos laukus, lai pieteiktu dalībnieku
                nodarbībām. Lūdzu, pārliecinieties par ievadīto datu
                precizitāti.
            </p>
        </header>

        <!-- Message Banners -->
        {#if $message}
            <div
                class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-950 dark:text-emerald-200 flex items-start gap-3 shadow-xs"
                role="status"
            >
                <CircleCheck
                    class="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5"
                />
                <div class="text-sm">
                    <p class="font-semibold">Paziņojums</p>
                    <p class="mt-0.5">{$message}</p>
                </div>
            </div>
        {/if}

        {#if $allErrors.length > 0}
            <div
                class="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive flex items-start gap-3 shadow-xs"
                role="alert"
            >
                <CircleAlert class="size-5 shrink-0 mt-0.5" />
                <div class="text-sm space-y-1">
                    <p class="font-semibold">
                        Lūdzu, izlabojiet kļūdas veidlapā:
                    </p>
                    <ul class="list-disc list-inside text-xs space-y-0.5">
                        {#each $allErrors as err}
                            <li>
                                <span class="font-medium">{err.path}:</span>
                                {err.messages.join(", ")}
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        {/if}

        <!-- Main Form Card -->
        <Card.Root class="border shadow-xs">
            <form method="post" use:enhance>
                <Card.Header class="pb-4">
                    <Card.Title class="text-xl"
                        >Pieteikuma informācija</Card.Title
                    >
                    <Card.Description>
                        Obligātie lauki ir atzīmēti ar zvaigznīti (<span
                            class="text-destructive font-bold">*</span
                        >).
                    </Card.Description>
                </Card.Header>

                <Card.Content class="space-y-8 pb-4">
                    <!-- SECTION 1: Dalībnieka dati -->
                    <section
                        aria-labelledby="section-student-info"
                        class="space-y-4"
                    >
                        <div
                            class="flex items-center gap-2 text-base font-semibold text-foreground"
                        >
                            <div
                                class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
                            >
                                <User class="size-4" />
                            </div>
                            <h2 id="section-student-info">Dalībnieka dati</h2>
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Form.Field {form} name="firstName">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label
                                            >Vārds <span
                                                class="text-destructive">*</span
                                            ></Form.Label
                                        >
                                        <Input
                                            {...props}
                                            bind:value={$formData.firstName}
                                            autocomplete="given-name"
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>

                            <Form.Field {form} name="lastName">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label
                                            >Uzvārds <span
                                                class="text-destructive">*</span
                                            ></Form.Label
                                        >
                                        <Input
                                            {...props}
                                            bind:value={$formData.lastName}
                                            autocomplete="family-name"
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Form.Field {form} name="personCode">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label
                                            >Personas kods <span
                                                class="text-destructive">*</span
                                            ></Form.Label
                                        >
                                        <Input
                                            {...props}
                                            bind:value={$formData.personCode}
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>

                            <Form.Field {form} name="address">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label
                                            >Adrese <span
                                                class="text-destructive">*</span
                                            ></Form.Label
                                        >
                                        <Input
                                            {...props}
                                            bind:value={$formData.address}
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Form.Field {form} name="email">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label>E-pasts</Form.Label>
                                        <Input
                                            {...props}
                                            type="email"
                                            bind:value={$formData.email}
                                            autocomplete="email"
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>

                            <Form.Field {form} name="phone">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label>Tālrunis</Form.Label>
                                        <Input
                                            {...props}
                                            type="tel"
                                            bind:value={$formData.phone}
                                            autocomplete="tel"
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div class="sm:col-span-2">
                                <Form.Field
                                    {form}
                                    name="educationalInstitution"
                                >
                                    <Form.Control>
                                        {#snippet children({ props })}
                                            <Form.Label
                                                >Izglītības iestāde <span
                                                    class="text-destructive"
                                                    >*</span
                                                ></Form.Label
                                            >
                                            <Input
                                                {...props}
                                                bind:value={
                                                    $formData.educationalInstitution
                                                }
                                            />
                                        {/snippet}
                                    </Form.Control>
                                    <Form.FieldErrors />
                                </Form.Field>
                            </div>

                            <div>
                                <Form.Field {form} name="grade">
                                    <Form.Control>
                                        {#snippet children({ props })}
                                            <Form.Label
                                                >Klase <span
                                                    class="text-destructive"
                                                    >*</span
                                                ></Form.Label
                                            >
                                            <Input
                                                {...props}
                                                type="number"
                                                bind:value={$formData.grade}
                                                placeholder="1 - 12"
                                            />
                                        {/snippet}
                                    </Form.Control>
                                    <Form.FieldErrors />
                                </Form.Field>
                            </div>
                        </div>
                    </section>

                    <Separator />

                    <!-- SECTION 2: Pirmā vecāka / likumiskā pārstāvja dati -->
                    <section
                        aria-labelledby="section-primary-guardian"
                        class="space-y-4"
                    >
                        <div
                            class="flex items-center gap-2 text-base font-semibold text-foreground"
                        >
                            <div
                                class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
                            >
                                <Users class="size-4" />
                            </div>
                            <div>
                                <h2 id="section-primary-guardian">
                                    Pirmā vecāka / likumiskā pārstāvja dati
                                </h2>
                                <p
                                    class="text-xs font-normal text-muted-foreground"
                                >
                                    Galvenā kontaktpersona saziņai
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Form.Field {form} name="primaryGuardianFirstName">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label
                                            >Vārds <span
                                                class="text-destructive">*</span
                                            ></Form.Label
                                        >
                                        <Input
                                            {...props}
                                            bind:value={
                                                $formData.primaryGuardianFirstName
                                            }
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>

                            <Form.Field {form} name="primaryGuardianLastName">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label
                                            >Uzvārds <span
                                                class="text-destructive">*</span
                                            ></Form.Label
                                        >
                                        <Input
                                            {...props}
                                            bind:value={
                                                $formData.primaryGuardianLastName
                                            }
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Form.Field {form} name="primaryGuardianEmail">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label>
                                            E-pasts<span
                                                class="text-destructive">*</span
                                            >
                                        </Form.Label>
                                        <Input
                                            {...props}
                                            type="email"
                                            bind:value={
                                                $formData.primaryGuardianEmail
                                            }
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>

                            <Form.Field {form} name="primaryGuardianPhone">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label
                                            >Tālrunis<span
                                                class="text-destructive">*</span
                                            ></Form.Label
                                        >
                                        <Input
                                            {...props}
                                            type="tel"
                                            bind:value={
                                                $formData.primaryGuardianPhone
                                            }
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>
                        </div>
                    </section>

                    <Separator />

                    <!-- SECTION 3: Otrā vecāka / likumiskā pārstāvja dati -->
                    <section
                        aria-labelledby="section-secondary-guardian"
                        class="space-y-4"
                    >
                        <div class="flex items-center justify-between">
                            <div
                                class="flex items-center gap-2 text-base font-semibold text-foreground"
                            >
                                <div
                                    class="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                                >
                                    <Users class="size-4" />
                                </div>
                                <div>
                                    <h2 id="section-secondary-guardian">
                                        Otrā vecāka / likumiskā pārstāvja dati
                                    </h2>
                                    <p
                                        class="text-xs font-normal text-muted-foreground"
                                    >
                                        Neobligāta papildu kontaktpersona
                                        saziņai
                                    </p>
                                </div>
                            </div>
                            <span
                                class="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground font-medium"
                                >Neobligāts</span
                            >
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Form.Field
                                {form}
                                name="secondaryGuardianFirstName"
                            >
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label>Vārds</Form.Label>
                                        <Input
                                            {...props}
                                            bind:value={
                                                $formData.secondaryGuardianFirstName
                                            }
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>

                            <Form.Field {form} name="secondaryGuardianLastName">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label>Uzvārds</Form.Label>
                                        <Input
                                            {...props}
                                            bind:value={
                                                $formData.secondaryGuardianLastName
                                            }
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Form.Field {form} name="secondaryGuardianEmail">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label>E-pasts</Form.Label>
                                        <Input
                                            {...props}
                                            type="email"
                                            bind:value={
                                                $formData.secondaryGuardianEmail
                                            }
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>

                            <Form.Field {form} name="secondaryGuardianPhone">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label>Tālrunis</Form.Label>
                                        <Input
                                            {...props}
                                            type="tel"
                                            bind:value={
                                                $formData.secondaryGuardianPhone
                                            }
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>
                        </div>
                    </section>

                    <Separator />

                    <!-- SECTION 4: Pulciņa izvēle -->
                    <section
                        aria-labelledby="section-club-selection"
                        class="space-y-4"
                    >
                        <Form.Field {form} name="clubId">
                            <div
                                class="flex items-center gap-2 text-base font-semibold text-foreground"
                            >
                                <div
                                    class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
                                >
                                    <GraduationCap class="size-4" />
                                </div>

                                <h2 id="section-club-selection">
                                    Pulciņa izvēle
                                </h2>
                            </div>

                            <p class="text-sm text-muted-foreground">
                                Izvēlieties vienu pulciņu, kuram vēlaties
                                pieteikties. Pieteikumi tiek izskatīti pirms
                                dalībnieku apstiprināšanas.
                            </p>

                            <Form.FieldErrors />

                            <div
                                class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                                role="radiogroup"
                                aria-labelledby="section-club-selection"
                            >
                                {#each data.clubs as club (club.id)}
                                    {@const isSelected =
                                        selectedClubId === club.id}

                                    <Card.Root
                                        role="radio"
                                        aria-checked={isSelected}
                                        class={[
                                            "group relative overflow-hidden transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                                            isSelected
                                                ? "ring-2 ring-primary/20 border-primary bg-primary/10"
                                                : "border-border hover:border-primary/50 bg-background",
                                        ]}
                                        onclick={() => {
                                            selectedClubId = club.id;
                                        }}
                                        onkeydown={(event) => {
                                            if (
                                                event.key === "Enter" ||
                                                event.key === " "
                                            ) {
                                                event.preventDefault();
                                                selectedClubId = club.id;
                                            }
                                        }}
                                    >
                                        <!-- Selection indicator -->
                                        <div
                                            class={[
                                                "absolute right-5 top-5 flex size-7 items-center justify-center rounded-full border-2 transition-all duration-200",
                                                isSelected
                                                    ? "border-primary bg-primary"
                                                    : "border-muted-foreground/30 bg-background",
                                            ]}
                                            class:border-primary={isSelected}
                                            class:bg-primary={isSelected}
                                        >
                                            {#if isSelected}
                                                <Check
                                                    class="size-4 text-primary-foreground"
                                                    strokeWidth={3}
                                                />
                                            {/if}
                                        </div>

                                        <Card.Header class="pr-14">
                                            <Card.Title class="text-lg">
                                                {club.name}
                                            </Card.Title>

                                            <Card.Description>
                                                {club.minGrade}. - {club.maxGrade}.
                                                klase
                                            </Card.Description>
                                        </Card.Header>

                                        <Card.Content class="space-y-4">
                                            <!-- Applications -->
                                            <div class="space-y-2">
                                                <div
                                                    class="flex items-center justify-between gap-2 text-sm"
                                                >
                                                    <div
                                                        class="flex items-center gap-2"
                                                    >
                                                        <Users
                                                            class="size-4 text-muted-foreground"
                                                        />

                                                        <span>
                                                            <span
                                                                class="font-medium"
                                                            >
                                                                {club.applicationCount}
                                                            </span>

                                                            {club.applicationCount ===
                                                            1
                                                                ? " pieteikums"
                                                                : " pieteikumi"}
                                                        </span>
                                                    </div>

                                                    <span
                                                        class="text-muted-foreground"
                                                    >
                                                        {club.maxParticipants} vietas
                                                    </span>
                                                </div>
                                            </div>

                                            <!-- Expandable description -->
                                            <Collapsible.Root>
                                                <Collapsible.Trigger
                                                    class={buttonVariants({
                                                        variant: "ghost",
                                                        size: "sm",
                                                        class: "group/read-more w-full justify-between px-2",
                                                    })}
                                                    onclick={(
                                                        event: MouseEvent,
                                                    ) => {
                                                        // Don't select the card when
                                                        // clicking "Lasīt vairāk".
                                                        event.stopPropagation();
                                                    }}
                                                >
                                                    <span>Lasīt vairāk</span>
                                                    <ChevronDown
                                                        class="size-4 transition-transform duration-200 group-data-[state=open]/read-more:rotate-180"
                                                    />
                                                    <!-- {#snippet child({ props })}
                                                        <Button
                                                            {...props}
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            class="group/read-more w-full justify-between px-2"
                                                            onclick={(
                                                                event,
                                                            ) => {
                                                                // Don't select the card when
                                                                // clicking "Lasīt vairāk".
                                                                event.stopPropagation();
                                                            }}
                                                        >
                                                            <span
                                                                >Lasīt vairāk</span
                                                            >

                                                            <ChevronDown
                                                                class="size-4 transition-transform duration-200 group-data-[state=open]/read-more:rotate-180"
                                                            />
                                                        </Button>
                                                    {/snippet} -->
                                                </Collapsible.Trigger>

                                                <Collapsible.Content
                                                    class="px-2 pt-2 text-sm leading-6 text-muted-foreground"
                                                >
                                                    {club.description}
                                                </Collapsible.Content>
                                            </Collapsible.Root>
                                        </Card.Content>

                                        <Card.Footer>
                                            {#if isSelected}
                                                <div
                                                    class="
								w-full rounded-md
								bg-primary/10
								px-3 py-2
								text-center text-sm font-medium
								text-primary
							"
                                                >
                                                    Izvēlēts
                                                </div>
                                            {:else}
                                                <div
                                                    class="
								w-full rounded-md border
								px-3 py-2
								text-center text-sm font-medium
								transition-colors
								group-hover:border-primary
								group-hover:text-primary
							"
                                                >
                                                    Izvēlēties
                                                </div>
                                            {/if}
                                        </Card.Footer>
                                    </Card.Root>
                                {/each}
                            </div>
                        </Form.Field>
                    </section>

                    <Separator />

                    <!-- SECTION 5: Noteikumi un piekrišanas -->
                    <section
                        aria-labelledby="section-agreements"
                        class="space-y-4"
                    >
                        <div class="space-y-3 bg-muted/20 px-4">
                            <div class="flex items-start gap-3">
                                <Checkbox
                                    id="processing-agreement"
                                    bind:checked={processingAgreement}
                                    required
                                    class="mt-1 border-black! dark:border-white!"
                                />
                                <Label
                                    for="processing-agreement"
                                    class="text-xs sm:text-sm font-normal text-foreground leading-relaxed cursor-pointer"
                                >
                                    Piekrītu, ka mani un dalībnieka norādītie
                                    personas dati tiek apstrādāti saskaņā ar
                                    piemērojamiem normatīvajiem aktiem nodarbību
                                    organizēšanas un saziņas nolūkos. <span
                                        class="text-destructive">*</span
                                    >
                                </Label>
                            </div>

                            <div class="flex items-start gap-3">
                                <Checkbox
                                    id="rules-agreement"
                                    bind:checked={rulesAgreement}
                                    required
                                    class="mt-1 border-black! dark:border-white!"
                                />
                                <Label
                                    for="rules-agreement"
                                    class="text-xs sm:text-sm font-normal text-foreground leading-relaxed cursor-pointer"
                                >
                                    Esmu iepazinies(-usies) ar nodarbību
                                    iekšējās kārtības un drošības noteikumiem un
                                    apņemos tos ievērot. <span
                                        class="text-destructive">*</span
                                    >
                                </Label>
                            </div>
                        </div>
                    </section>
                </Card.Content>

                <Card.Footer
                    class="flex flex-col sm:flex-row items-center justify-between gap-4 border-t bg-muted/10 px-6 py-4"
                >
                    <p
                        class="text-xs text-muted-foreground text-center sm:text-left"
                    >
                        Nospiežot "Iesniegt pieteikumu", dati tiks nosūtīti
                        apstrādei.
                    </p>
                    <Button
                        type="submit"
                        disabled={$delayed ||
                            !processingAgreement ||
                            !rulesAgreement}
                        class="w-full sm:w-auto min-w-44 gap-2 font-medium"
                    >
                        {#if $delayed}
                            <LoaderCircle class="size-4 animate-spin" />
                            <span>Nosūta...</span>
                        {:else}
                            <Send class="size-4" />
                            <span>Iesniegt pieteikumu</span>
                        {/if}
                    </Button>
                </Card.Footer>
            </form>
        </Card.Root>
    </div>

    <footer class="mt-10 border-t-2 py-4 flex flex-col items-center">
        <span
            class="flex items-center justify-center text-sm text-muted-foreground"
        >
            <Copyright class="size-4 inline-block mr-2" />
            {new Date().getFullYear()} - Siguldas novada Jaunrades centrs
        </span>
        <Button variant="link" href={authRedirectUri}>
            Pieslēgšanās darbiniekiem
        </Button>
    </footer>
</main>
