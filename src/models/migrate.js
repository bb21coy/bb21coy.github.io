import { getDocs, updateDoc, queryDocs } from "../methods.js";
import { normalizeOldPrimer } from "./Primer.js";

export async function migratePrimers(request, env) {
    console.log("migrating primers");
    const primers = await queryDocs(env, "users", "account_type", "EQUAL", "Primer");

    for (const p of primers) {
        await updateDoc(env, "users", p.id, normalizeOldPrimer(p));
    }

    return primers.map(normalizeOldPrimer);
}