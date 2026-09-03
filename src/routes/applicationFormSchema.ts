import { z } from "zod";

export const applicationFormSchema = z.object({
    firstName: z.string().min(1, { message: "Dalībnieka vārds ir obligāts" }).max(100, { message: "Dalībnieka vārds nevar pārsniegt 100 rakstzīmes" }),
    lastName: z.string().min(1, { message: "Dalībnieka uzvārds ir obligāts" }).max(100, { message: "Dalībnieka uzvārds nevar pārsniegt 100 rakstzīmes" }),
    personCode: z.string().regex(/^\d{6}-\d{5}$/, { message: "Dalībnieka personas kodam jābūt formatā xxxxxx-xxxxx" }),
    address: z.string().min(1, { message: "Dalībnieka adrese ir obligāta" }).max(255, { message: "Dalībnieka adrese nevar pārsniegt 255 rakstzīmes" }),
    email: z.email({ message: "Nederīga dalībnieka e-pasta adrese" }).max(255).optional(),
    phone: z.string().max(20).optional(),
    educationalInstitution: z.string().min(1, { message: "Dalībnieka izglītības iestāde ir obligāta" }).max(255, { message: "Dalībnieka izglītības iestāde nevar pārsniegt 255 rakstzīmes" }),
    grade: z.number().int().min(1, { message: "Dalībnieka klase ir obligāta" }).max(12, { message: "Dalībnieka klase nevar pārsniegt 12" }).default(1),
    primaryGuardianFirstName: z.string().min(1, { message: "Pirmā vecāka vārds ir obligāts" }).max(100, { message: "Pirmā vecāka vārds nevar pārsniegt 100 rakstzīmes" }),
    primaryGuardianLastName: z.string().min(1, { message: "Pirmā vecāka uzvārds ir obligāts" }).max(100, { message: "Pirmā vecāka uzvārds nevar pārsniegt 100 rakstzīmes" }),
    primaryGuardianEmail: z.email({ message: "Nederīga pirmā vecāka e-pasta adrese" }).max(255),
    primaryGuardianPhone: z.string().min(1, { message: "Pirmā vecāka tālrunis ir obligāts" }).max(20, { message: "Pirmā vecāka tālrunis nevar pārsniegt 20 rakstzīmes" }),
    secondaryGuardianFirstName: z.string().max(100, { message: "Otrā vecāka vārds nevar pārsniegt 100 rakstzīmes" }).optional(),
    secondaryGuardianLastName: z.string().max(100, { message: "Otrā vecāka uzvārds nevar pārsniegt 100 rakstzīmes" }).optional(),
    secondaryGuardianEmail: z.email({ message: "Nederīga otrā vecāka e-pasta adrese" }).max(255).optional(),
    secondaryGuardianPhone: z.string().max(20, { message: "Otrā vecāka tālrunis nevar pārsniegt 20 rakstzīmes" }).optional(),
    clubId: z.number().int().min(1, { message: "Jāizvēlās viens pulciņš" }).default(0),
});

export type ApplicationFormSchema = typeof applicationFormSchema