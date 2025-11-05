const RANK_MAP = { C: "CLT", S: "SCL" };
const RANK_REVERSE = { CLT: "C", SCL: "S" };

const CLASS_MAP = { V: "VAL", F: "STAFF", U: "UNI", P: "POLY" };
const CLASS_REVERSE = { VAL: "V", STAFF: "F", UNI: "U", POLY: "P" };

export function decode(obj) {
    return {
        account_name: obj.n ?? null,
        account_type: obj.t ?? "Primer",
        honorifics: obj.h ?? null,
        rank: obj.r ? RANK_MAP[obj.r] : null,
        credentials: obj.c ?? null,
        roll_call: obj.a ?? true,
        class1: obj.s ? CLASS_MAP[obj.s] : null,

        rank_full: obj.r ? RANK_MAP[obj.r] : null,
        display_name:
            (obj.r ? RANK_MAP[obj.r] : obj.h ? obj.h : "") +
            (obj.account_name ? " " + obj.account_name : "")
    };
}

export function encode(obj) {
    return {
        n: obj.account_name,
        t: obj.account_type ?? "Primer",
        h: obj.honorifics ?? null,
        r: obj.rank ? RANK_REVERSE[obj.rank] : null,
        c: obj.credentials ?? null,
        a: obj.roll_call ?? true,
        s: obj.class1 ? CLASS_REVERSE[obj.class1] : null
    };
}

export function validatePrimer(input) {
    const rank = input.rank;
    const honorifics = input.honorifics;
    const class1 = input.class1;

    if (rank) {
        input.honorifics = null;
        input.class1 = null;
    } else {
        if (!honorifics) throw new Error("Honorifics is required if rank is not set.");
        if (!class1) throw new Error("Class is required if rank is not set.");
    }

    return input;
}

export function normalizeOldPrimer(obj) {
    return {
        n: obj.account_name ?? null,
        t: obj.account_type ?? "Primer",
        h: obj.honorifics ?? null,
        r: obj.rank ? RANK_REVERSE[obj.rank] : null,
        c: obj.credentials ?? null,
        a: obj.roll_call ?? true,
        s: obj.class1 ? CLASS_REVERSE[obj.class1] : null,
    };
}