import unwrap from "./unwrap.js";
import getAccessToken from "./auth.js";

async function getDoc(env, col, id) {
    const token = await getAccessToken(env);
    const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${col}/${id}`;
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
    return res.json();
}

async function getDocs(env, col) {
    try {
        const token = await getAccessToken(env);

        const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${col}`;

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const json = await res.json();

        return (json.documents || []).map(doc => ({
            id: doc.name.split("/").pop(),
            ...unwrap(doc.fields)
        }));
    } catch (err) {
        console.error(`getDocs(${col}) failed:`, err);
        throw new Error(err);
    }
}

async function updateDoc(env, col, id, data) {
    const token = await getAccessToken(env);

    const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${col}/${id}`;

    const body = {
        fields: wrapValues(data)
    };

    const res = await fetch(url, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const err = await res.text();
        console.error(`updateDoc(${col}/${id}) failed:`, err);
        throw new Error(err);
    }

    return await res.json();
}

/**
 * Query documents in a collection
 * @param {*} env - environment
 * @param {*} col - collection
 * @param {*} field - field
 * @param {*} op - operator
 * @param {*} value - value
 * @returns 
 */
async function queryDocs(env, col, field, op, value) {
    const token = await getAccessToken(env);

    const body = {
        structuredQuery: {
            from: [{ collectionId: col }],
            where: {
                fieldFilter: {
                    field: { fieldPath: field },
                    op: op,               // "EQUAL", "GREATER_THAN", etc.
                    value: wrapSingleValue(value)
                }
            }
        }
    };

    const res = await fetch(
        `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body),
        }
    );

    const json = await res.json();

    return json
        .filter(x => x.document)
        .map(x => ({
            id: x.document.name.split("/").pop(),
            ...unwrap(x.document.fields)
        }));
}

function wrapSingleValue(value) {
    if (value === null) return { nullValue: null };
    if (typeof value === "string") return { stringValue: value };
    if (typeof value === "boolean") return { booleanValue: value };
    if (typeof value === "number") return { integerValue: value };
    throw new Error("Unsupported Firestore value type");
}

function wrapValues(obj) {
    const out = {};
    for (const [key, value] of Object.entries(obj)) {
        out[key] = wrapSingleValue(value);
    }
    return out;
}


export { getDoc, getDocs, updateDoc, queryDocs };