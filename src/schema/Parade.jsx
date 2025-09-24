import { z } from "zod";
import { doc, getDoc, Timestamp } from "@firebase/firestore";

const makeRefSchema = (db, collection) =>
    z.union([z.string(), z.null()])
        .refine((val) => typeof val === "string" && val.trim() !== "", { message: "This appointment is required" })
        .transform((id, ctx) => {
            try {
                return doc(db, collection, id);
            } catch {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Invalid Firestore reference path"
                });
                return z.NEVER;
            }
        })
        .refine(
            async (ref) => {
                const snap = await getDoc(ref);
                return snap.exists();
            },
            { message: "Firestore document does not exist" }
        );

const DateTimeLocalSchema = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Must be in YYYY-MM-DDTHH:MM format")
    .refine((val) => !isNaN(new Date(val).getTime()), { message: "Invalid date value" })
    .transform((val) => Timestamp.fromDate(new Date(val)));

const AnnouncementSchema = z.object({
    id: z.string({ required_error: "ID is required" }),
    announcement: z.string({ required_error: "Announcement is required" })
}).strict();

const FilteredAnnouncements = z.array(AnnouncementSchema).transform(arr => arr.filter(item => item.announcement.trim() !== ""));

const FilledProgramSchema = z.object({
    id: z.string(),
    program: z.string().min(1, "Program is required"),
    start_time: DateTimeLocalSchema,
    end_time: DateTimeLocalSchema
}).strict();

const ProgramWithFilter = z.object({
    id: z.string().optional().or(z.literal("")),
    program: z.string().optional().or(z.literal("")),
    start_time: z.string().optional().or(z.literal("")),
    end_time: z.string().optional().or(z.literal(""))
}).strict()
    .transform((obj, ctx) => {
        const values = [obj.program, obj.start_time, obj.end_time].map(v => (v ?? "").trim());
        const allEmpty = values.every(v => v === "");

        if (allEmpty) return null;

        const parsed = FilledProgramSchema.safeParse(obj);
        if (!parsed.success) {
            parsed.error.issues.forEach(issue => ctx.addIssue(issue));
            return z.NEVER;
        }

        return parsed.data;
    });


const FilteredPrograms = z.array(ProgramWithFilter).transform(arr => arr.filter(item => item !== null));

const DateOnlySchema = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format")
    .refine((val) => !isNaN(new Date(val).getTime()), {
        message: "Invalid date value",
    })
    .transform((val) => {
        return Timestamp.fromDate(new Date(val + "T00:00:00"));
    });

const ParadeSchema = (db) => z.object({
    parade_type: z.enum(["Parade", "Camp", "Others"]),
    appointments: z.object({
        DT: makeRefSchema(db, "users"),
        DO: makeRefSchema(db, "users"),
        COS: makeRefSchema(db, "users"),
        "Flag Bearer": makeRefSchema(db, "users"),
        CSM: makeRefSchema(db, "users"),
        "CE Sergeant": makeRefSchema(db, "users"),
    }).strict(),
    company_announcements: FilteredAnnouncements,
    date: DateOnlySchema,
    description: z.string(),
    dismissal_time: DateTimeLocalSchema,
    reporting_time: DateTimeLocalSchema,
    platoon_announcements: z.object({
        "1": FilteredAnnouncements,
        "2": FilteredAnnouncements,
        "3": FilteredAnnouncements,
        "4/5": FilteredAnnouncements,
    }).strict(),
    platoon_programs: z.object({
        "1": FilteredPrograms,
        "2": FilteredPrograms,
        "3": FilteredPrograms,
        "4/5": FilteredPrograms.optional(),
    }).strict(),
    "sec-1-attire": z.string().nonempty("Sec 1 attire is required"),
    "sec-2-attire": z.string().nonempty("Sec 2 attire is required"),
    "sec-3-attire": z.string().nonempty("Sec 3 attire is required"),
    "sec-4/5-attire": z.string(),
    venue: z.string(),
}).strict().refine(
    (data) => data.dismissal_time.toMillis() > data.reporting_time.toMillis(),
    {
        message: "Dismissal time must be after reporting time",
        path: ["dismissal_time"], // attach error to dismissal_time
    }
);;

export default ParadeSchema