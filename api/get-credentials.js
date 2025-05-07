const express = require('express');
const serverless = require('serverless-http');
const admin = require('firebase-admin');
const app = express();

app.use(express.json());

// Initialize Firebase Admin SDK using environment variable
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

app.get('/', async (req, res) => {
    const { transactionId } = req.query;
    if (!transactionId) {
        return res.status(400).send({ status: 'error', message: 'Missing transactionId' });
    }

    try {
        const snapshot = await db.ref('backendCredentials/' + transactionId).once('value');
        if (!snapshot.exists()) {
            return res.status(404).send({ status: 'pending' });
        }

        const credentials = snapshot.val();
        await db.ref('backendCredentials/' + transactionId).remove();
        res.status(200).send({ status: 'success', credentials: { username: credentials.username, password: credentials.password } });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});

module.exports = serverless(app);