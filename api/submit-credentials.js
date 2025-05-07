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
        databaseURL: 'https://passwordapp-d817c-default-rtdb.firebaseio.com' // Replace with your Realtime Database URL
    });
}

const db = admin.database();

app.post('/', async (req, res) => {
    const { transactionId, username, password } = req.query;
    if (!transactionId || !username || !password) {
        return res.status(400).send({ status: 'error', message: 'Missing parameters' });
    }

    try {
        await db.ref('backendCredentials/' + transactionId).set({
            username,
            password,
            createdAt: admin.database.ServerValue.TIMESTAMP
        });
        res.status(200).send({ status: 'success' });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});

module.exports = serverless(app);