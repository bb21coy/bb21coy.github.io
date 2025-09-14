import { z } from "zod";

const UserSchema = z.object({
    account_name: z.string().min(1),
    
    account_type: z.enum(["Admin", "Officer", "Primer", "Boy"]),
    graduated: z.boolean().nullable().default(false),
    honorifics: z.enum(["Mr", "Ms", "Mrs"]).nullable().default(null),
    level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.null()]).default(null),

    rank: z.string().nullable().default(null),
    credentials: z.string().nullable().default(null),
    roll_call: z.boolean().nullable().default(true),

    class1: z.string().nullable().default(null),
    class2: z.string().nullable().default(null),
    class3: z.string().nullable().default(null),
    class4: z.string().nullable().default(null),
    class5: z.string().nullable().default(null),

    rank1: z.string().nullable().default(null),
    rank2: z.string().nullable().default(null),
    rank3: z.string().nullable().default(null),
    rank4: z.string().nullable().default(null),
    rank5: z.string().nullable().default(null),

    member_id: z.string().nullable().default(null),
});

const UserSchemaWithRules = UserSchema.superRefine((data, ctx) => {
    // Rank validation
    const ranksByType = {
        Admin: [null],
        Officer: [null, "OCT", "2LT", "LTA"],
        Primer: [null, "CLT", "SCL"],
        Boy: ["REC", "PTE", "LCP", "CPL", "SGT", "SSG", "WO"],
    };

    if (!ranksByType[data.account_type].includes(data.rank)) {
        ctx.addIssue({
            code: "custom",
            message: `Rank "${data.rank}" is not valid for account type "${data.account_type}"`,
            path: ["rank"],
        });
    }

    // Credentials rule
    if (data.account_type === "Boy" && data.credentials !== null) {
        ctx.addIssue({
            code: "custom",
            message: "Credentials must be null for Boys",
            path: ["credentials"],
        });
    }

    // Roll call rule
    if (data.account_type === "Admin" && data.roll_call !== null) {
        ctx.addIssue({
            code: "custom",
            message: "Roll call must be null for Admin",
            path: ["roll_call"],
        });
    }
    if (data.account_type !== "Admin" && data.roll_call === null) {
        ctx.addIssue({
            code: "custom",
            message: "Roll call is required for non-Admins",
            path: ["roll_call"],
        });
    }

    // Rank1–5 rules
    if (data.account_type !== "Boy") {
        ["rank1", "rank2", "rank3", "rank4", "rank5"].forEach((field) => {
            if (data[field] !== null) {
                ctx.addIssue({
                    code: "custom",
                    message: `${field} must be null for ${data.account_type}`,
                    path: [field],
                });
            }
        });
    }
});

export default UserSchemaWithRules;