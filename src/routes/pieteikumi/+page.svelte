<script lang="ts">
    import { type Application } from "$lib/server/db/schema";
    import * as Table from "$lib/components/ui/table/index";
    import { Button } from "$lib/components/ui/button/index";

    let { data }: { data: { applications: Application[] } } = $props();
    let editingApplication = $state<Application | null>(null);
    let dialogOpen = $state(false);
</script>

<Button variant="link" href="/">Sākumlapa</Button>
<Button variant="link" href="/.auth/logout">Iziet</Button>
<Button variant="link" href="/pulcini">Rediģēt pulciņus</Button>

<Table.Root>
    <Table.Caption>Pieteikumu tabula</Table.Caption>
    <Table.Header>
        <Table.Row>
            <Table.Head>Vārds</Table.Head>
            <Table.Head>Uzvārds</Table.Head>
            <Table.Head>Personas kods</Table.Head>
            <Table.Head>Epasts</Table.Head>
            <Table.Head>Tālrunis</Table.Head>
            <Table.Head>Adrese</Table.Head>
            <Table.Head>Izglītības iestāde</Table.Head>
            <Table.Head>Klase</Table.Head>
            <Table.Head>Pirmā vecāka vārds</Table.Head>
            <Table.Head>Pirmā vecāka uzvārds</Table.Head>
            <Table.Head>Pirmā vecāka epasts</Table.Head>
            <Table.Head>Pirmā vecāka tālrunis</Table.Head>
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
                <Table.Cell>{application.personCode}</Table.Cell>
                <Table.Cell>{application.email}</Table.Cell>
                <Table.Cell>{application.phone}</Table.Cell>
                <Table.Cell>{application.address}</Table.Cell>
                <Table.Cell>{application.educationalInstitution}</Table.Cell>
                <Table.Cell>{application.grade}</Table.Cell>
                <Table.Cell>{application.primaryGuardianFirstName}</Table.Cell>
                <Table.Cell>{application.primaryGuardianLastName}</Table.Cell>
                <Table.Cell>{application.primaryGuardianEmail}</Table.Cell>
                <Table.Cell>{application.primaryGuardianPhone}</Table.Cell>
                <Table.Cell>
                    <Button
                        variant="secondary"
                        onclick={() => {
                            editingApplication = application;
                            dialogOpen = true;
                        }}>Rediģēt</Button
                    >
                </Table.Cell>
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Root>
