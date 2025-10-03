const XLSX = require("xlsx");

module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-filename");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

    try {
        // Collect uploaded file into a buffer
        let body = Buffer.alloc(0);
        await new Promise((resolve, reject) => {
            req.on("data", chunk => { body = Buffer.concat([body, chunk]); });
            req.on("end", resolve);
            req.on("error", reject);
        });

        if (!body.length) return res.status(400).json({ message: "No file uploaded" });

        const filename = req.query.filename || req.headers["x-filename"] || "uploaded.xls";
        if (!filename.toLowerCase().endsWith(".xls")) {
            return res.status(400).json({ message: "Only .xls files are supported" });
        }

        // Read the .xls and write out as .xlsx
        const wb = XLSX.read(body, { type: "buffer" });
        const out = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

        res.setHeader("Content-Disposition", 'attachment; filename="converted.xlsx"');
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.end(out); // ✅ works properly on Vercel
    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ message: err.message });
    }
};
