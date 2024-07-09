const express = require('express');
const router = express.Router();
const axios = require('axios');

const USER_SERVICE_URL = 'http://localhost:8080/users';
const AUTH_SERVICE_URL = 'http://localhost:8081/auth';
const PAYMENT_SERVICE_URL = 'http://localhost:8082/payments';
const NOTIFICATION_SERVICE_URL = 'http://localhost:8083/notifications';

router.get('/users', async (req, res) => {
    try {
        const response = await axios.get(USER_SERVICE_URL);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.post('/auth/login', async (req, res) => {
    try {
        const response = await axios.post(`${AUTH_SERVICE_URL}/login`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/auth/register', async (req, res) => {
    try {
        const response = await axios.post(`${AUTH_SERVICE_URL}/register`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/payments', async (req, res) => {
    try {
        const response = await axios.post(PAYMENT_SERVICE_URL, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

router.post('/notifications', async (req, res) => {
    try {
        await axios.post(NOTIFICATION_SERVICE_URL, req.body);
        res.status(200).json({ message: 'Notification sent' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

module.exports = router;
