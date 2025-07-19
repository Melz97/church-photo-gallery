// server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.env.RENDER_DATA_DIR || __dirname, 'db.json');
const ADMIN_PASSWORD = 'your-very-secret-password'; // 🔒 IMPORTANT: Change this!

// Middleware to handle JSON data and serve your HTML/CSS files
app.use(express.json());
app.use(express.static(__dirname)); // Serves files from the current directory

// Authentication middleware to protect routes
const requireAuth = (req, res, next) => {
    const password = req.headers['x-admin-password'];
    if (password && password === ADMIN_PASSWORD) {
        next(); // Password is correct, proceed.
    } else {
        res.status(401).json({ message: 'Unauthorized: Admin password required.' });
    }
};

// --- API ROUTES ---

// [PUBLIC] Gets all photos for the gallery
app.get('/api/photos', async (req, res) => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        // If the database file doesn't exist, return an empty array
        res.json([]);
    }
});

// [PROTECTED] Adds new photos to the database
app.post('/api/photos', requireAuth, async (req, res) => {
    const newPhotos = req.body;
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        const currentPhotos = JSON.parse(data);
        const allPhotos = [...currentPhotos, ...newPhotos];
        await fs.writeFile(DB_PATH, JSON.stringify(allPhotos, null, 2));
        res.status(201).json({ message: 'Photos added successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving photos.' });
    }
});

// [PROTECTED] Deletes all photos from the database
app.delete('/api/photos', requireAuth, async (req, res) => {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify([], null, 2)); // Overwrite with empty array
        res.status(200).json({ message: 'All photos deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting photos.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
    console.log(`🔑 Your admin password is: ${ADMIN_PASSWORD}`);
});