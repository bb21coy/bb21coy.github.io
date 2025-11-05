async function getAccessToken(env) {
    const header = {
        alg: "RS256",
        typ: "JWT",
    };

    const now = Math.floor(Date.now() / 1000);
    const claim = {
        iss: env.FIREBASE_CLIENT_EMAIL,
        scope: "https://www.googleapis.com/auth/datastore",
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600,
        iat: now,
    };

    // Encode Base64 URL Safe (Firestore REQUIRES url-safe, NOT normal base64)
    function b64url(obj) {
        return btoa(JSON.stringify(obj))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }

    const unsigned = `${b64url(header)}.${b64url(claim)}`;

    // Fix the private key formatting:
    const pem = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

    const cleaned = pem
        .replace(/-----BEGIN PRIVATE KEY-----/g, "")
        .replace(/-----END PRIVATE KEY-----/g, "")
        .replace(/\s+/g, "");

    const binary = Uint8Array.from(atob(cleaned), c => c.charCodeAt(0));
    const privateKey = await crypto.subtle.importKey(
        "pkcs8",
        binary.buffer,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signatureArrayBuffer = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        privateKey,
        new TextEncoder().encode(unsigned)
    );

    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureArrayBuffer)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    const jwt = `${unsigned}.${signature}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });

    const json = await res.json();
    if (!json.access_token) {
        console.error(json);
        throw new Error("Failed to exchange JWT for access token");
    }

    return json.access_token;
}

export default getAccessToken