function unwrap(fields) {
    const out = {};
    for (const [key, val] of Object.entries(fields)) {
        const type = Object.keys(val)[0];
        out[key] = val[type];
    }
    return out;
}

export default unwrap;