import Audit from "./models/Audit.js";

export default function logChange({ target, updatedBy, changes, collection }) {
    Audit.create({
        user: updatedBy ?? "SYSTEM",
        target,
        collection,
        changes
    }).catch(() => { });
}
