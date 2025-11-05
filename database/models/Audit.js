import { Schema, model } from "mongoose";

const AuditLogSchema = new Schema({
    ts: { type: Date, default: Date.now },
    user: String,
    target: String,
    collection: String,
    changes: [String]
}, { versionKey: false });

export default model("Audit", AuditLogSchema, "audit_logs");