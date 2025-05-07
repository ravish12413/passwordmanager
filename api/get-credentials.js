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
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { transactionId } = req.query;
    if (!transactionId) {
        return res.status(400).json({ status: 'error', message: 'Missing transactionId' });
    }

    try {
        const snapshot = await db.ref('backendCredentials/' + transactionId).once('value');
        if (!snapshot.exists()) {
            return res.status(404).json({ status: 'pending' });
        }

        const credentials = snapshot.val();
        await db.ref('backendCredentials/' + transactionId).remove();

        return res.status(200).json({
            status: 'success',
            credentials: {
                username: credentials.username,
                password: credentials.password
            }
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
