const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const USER_SERVICE_URL = 'http://localhost:8080/users';
const AUTH_SERVICE_URL = 'http://localhost:8081/auth';
const PAYMENT_SERVICE_URL = 'http://localhost:8082/payments';
const NOTIFICATION_SERVICE_URL = 'http://localhost:8083/notifications';

app.get('/api/users', async (req, res) => {
    try {
        const response = await axios.get(USER_SERVICE_URL);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const response = await axios.post(`${AUTH_SERVICE_URL}/login`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const response = await axios.post(`${AUTH_SERVICE_URL}/register`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/payments', async (req, res) => {
    try {
        const response = await axios.post(PAYMENT_SERVICE_URL, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

app.post('/api/notifications', async (req, res) => {
    try {
        await axios.post(NOTIFICATION_SERVICE_URL, req.body);
        res.status(200).json({ message: 'Notification sent' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
