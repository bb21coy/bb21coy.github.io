const cookie = require('cookie');
const { Types } = require('mongoose');
const { decodeJWT, checkAuthentication } = require('../functions.js');
const { connectToDatabase } = require('../mongoose.js');
const User = require('../models/users.js');
const UniformInspections = require('../models/uniform_inspections.js');
const { UniformComponent, ComponentField } = require('../models/uniform_components.js');

module.exports = async (req, res) => {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-route');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const route = req.headers['x-route'];
        const cookies = cookie.parse(req.headers.cookie || '');
        const authorization = cookies.token;
        const method = req.method;

        if (!route) return res.status(401).json({ message: 'Missing route in headers' });
        if (!authorization) return res.status(401).json({ message: 'Missing authorization token' });

        const routeKey = `${method.toUpperCase()} ${route}`;
        await connectToDatabase();

        switch (routeKey) {
            case 'GET /get_inspection_summary': {
                const auth = await checkAuthentication(authorization, res, ["Admin", "Officer", "Primer"]);
                if (!auth) return res.status(401).json({ message: 'Unauthorized' });

                const summary = await UniformInspections.find({}).populate("assessor").populate("boy").sort({ assessedDate: -1 });;
                const boys = await User.find({ account_type: 'Boy' }).select('_id account_name level');
                return res.status(200).json({ summary, boys });
            }

            case 'GET /get_inspection_components': {
                const auth = await checkAuthentication(authorization, res, ["Admin", "Officer", "Primer"]);
                if (!auth) return res.status(401).json({ message: 'Unauthorized' });

                const components = await UniformComponent.find({}).populate("components_fields");
                return res.status(200).json(components);
            }

            case 'POST /create_uniform_inspection': {
                const auth = await checkAuthentication(authorization, res, ["Admin", "Officer", "Primer"]);
                if (!auth) return res.status(401).json({ message: 'Unauthorized' });

                const decoded = await decodeJWT(authorization, res);
                const user = await User.findById(decoded.id);

                for (const [key, value] of Object.entries(req.body)) {
                    const remarksArr = Object.entries(value.remarks).map(([componentId, remark]) => ({
                        component: componentId,
                        remark
                    }));

                    const ids = value.fields.map(field => new Types.ObjectId(field));
                    const result = await ComponentField.aggregate([
                        { $match: { _id: { $in: ids } } },
                        { $group: { _id: null, totalScore: { $sum: "$field_score" } } }
                    ]);

                    const today = new Date();
                    const record = new UniformInspections({
                        boy: key,
                        score: result.length ? result[0].totalScore : 0,
                        assessedDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                        assessor: user._id,
                        fields: value.fields,
                        remarks: remarksArr
                    });

                    record.save();
                    return res.status(201).end();
                }
            }

            case "GET /get_user_inspection": {
                const auth = await checkAuthentication(authorization, res, ["Admin", "Officer", "Primer"]);
                if (!auth) return res.status(401).json({ message: 'Unauthorized' });

                const id = req.query.id ?? (await decodeJWT(authorization, res)).id;

                const inspections = await UniformInspections.find({ boy: id }).populate("assessor", "account_name rank").populate("boy", "account_name");
                return res.status(200).json(inspections);
            }

            default:
                return res.status(404).json({ message: 'Route not found' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};