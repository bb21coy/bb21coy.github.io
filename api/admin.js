const admin = require("firebase-admin");
const dotenv = require('dotenv');
dotenv.config({ quiet: true });

module.exports = async (req, res) => {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            }),
        });
    }

    const db = admin.firestore();
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        const method = req.method;

        if (!token) return res.status(401).json({ message: 'Missing authorization token' });
        const decoded = await admin.auth().verifyIdToken(token, true);
        if (!decoded) return res.status(401).json({ message: 'Invalid token' });

        const userDoc = await db.collection("users").doc(decoded.uid).get();
        if (!userDoc.exists) return res.status(401).json({ message: 'User not found' });
        const user = userDoc.data();
        if (user.account_type === "Boy" && !!user.appointment) return res.status(403).json({ message: 'Unauthorized' });

        switch (method) {
            case 'GET': {
                const uid = req.query.id;
                if (!uid) return res.status(400).json({ message: 'Missing user id' });
                const userRecord = await admin.auth().getUser(uid);
                return res.status(200).json(userRecord);
            }

            case 'POST': {
                const { email, password } = req.body;
                if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
                const userCredential = await admin.auth().createUser({ email, password });
                return res.status(200).json(userCredential);
            }

            case 'PUT': {
                const { uid, email, password } = req.body;
                if (!uid || !email || !password) return res.status(400).json({ message: 'Missing uid, email or password' });
                const updateData = {};
                if (email) updateData.email = email;
                if (password) updateData.password = password;

                if (Object.keys(updateData).length === 0) return res.status(400).json({ message: 'Nothing to update' });
                
                await admin.auth().updateUser(uid, updateData);
                console.log('User updated successfully');
                return res.status(200).end();
            }

            case 'DELETE': {
                const uid = req.query.id;
                if (!uid) return res.status(400).json({ message: 'Missing user id' });
                await admin.auth().deleteUser(uid);
                return res.status(200).end();
            }

            default: {
                return res.status(405).json({ message: 'Method not allowed' });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}