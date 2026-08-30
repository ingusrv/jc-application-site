import { z } from "zod";

export const applicationFormSchema = z.object({
    firstName: z.string().min(1, { message: "Vārds ir obligāts" }).max(100, { message: "Vārds nevar pārsniegt 100 rakstzīmes" }),
    lastName: z.string().min(1, { message: "Uzvārds ir obligāts" }).max(100, { message: "Uzvārds nevar pārsniegt 100 rakstzīmes" }),
    personCode: z.string().min(1, { message: "Personas kods ir obligāts" }).max(12, { message: "Personas kods nevar pārsniegt 12 rakstzīmes" }),
    address: z.string().min(1, { message: "Adrese ir obligāta" }).max(255, { message: "Adrese nevar pārsniegt 255 rakstzīmes" }),
    email: z.email({ message: "Nederīga e-pasta adrese" }).max(255).optional(),
    phone: z.string().max(20).optional(),
    educationalInstitution: z.string().min(1, { message: "Izglītības iestāde ir obligāta" }).max(255, { message: "Izglītības iestāde nevar pārsniegt 255 rakstzīmes" }),
    grade: z.number().int().min(1, { message: "Klase ir obligāta" }).max(12, { message: "Klase nevar pārsniegt 12" }),
    primaryGuardianFirstName: z.string().min(1, { message: "Vārds ir obligāts" }).max(100, { message: "Vārds nevar pārsniegt 100 rakstzīmes" }),
    primaryGuardianLastName: z.string().min(1, { message: "Uzvārds ir obligāts" }).max(100, { message: "Uzvārds nevar pārsniegt 100 rakstzīmes" }),
    primaryGuardianEmail: z.email({ message: "Nederīga e-pasta adrese" }).max(255),
    primaryGuardianPhone: z.string().min(1, { message: "Tālrunis ir obligāts" }).max(20, { message: "Tālrunis nevar pārsniegt 20 rakstzīmes" }),
    secondaryGuardianFirstName: z.string().max(100, { message: "Vārds nevar pārsniegt 100 rakstzīmes" }).optional(),
    secondaryGuardianLastName: z.string().max(100, { message: "Uzvārds nevar pārsniegt 100 rakstzīmes" }).optional(),
    secondaryGuardianEmail: z.email({ message: "Nederīga e-pasta adrese" }).max(255).optional(),
    secondaryGuardianPhone: z.string().max(20).optional(),
    clubId: z.number().int().min(1, { message: "Jāizvēlās viens pulciņš" }).default(1),
});

export type ApplicationFormSchema = typeof applicationFormSchema;