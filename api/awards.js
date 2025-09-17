const dotenv = require('dotenv');
const XLSX = require('xlsx');
dotenv.config({ quiet: true });

module.exports = async (req, res) => {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Disposition, Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const method = req.method;

        switch (method) {
            case 'POST': {
                let body = Buffer.alloc(0);

                await new Promise((resolve, reject) => {
                    req.on('data', chunk => {
                        body = Buffer.concat([body, chunk]);
                    });
                    req.on('end', resolve);
                    req.on('error', reject);
                });

                if (!body.length) return res.status(400).json({ message: 'No file uploaded' });

                const contentDisposition = req.headers['content-disposition'] || '';
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                const filename = match ? match[1] : 'uploaded.xls';

                if (!filename.toLowerCase().endsWith('.xls')) return res.status(400).json({ message: 'Only .xls files are supported' });

                try {
                    const wb = XLSX.read(body, { type: 'buffer' });
                    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

                    res.setHeader(
                        'Content-Disposition',
                        'attachment; filename="converted.xlsx"'
                    );
                    res.setHeader(
                        'Content-Type',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    );
                    return res.send(out);
                } catch (err) {
                    console.error(err);
                }
            }

            default:
                return res.status(405).json({ message: 'Method Not Allowed' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};