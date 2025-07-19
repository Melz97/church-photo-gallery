// server.js - NEW VERSION FOR SUPABASE

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// --- SUPABASE SETUP ---
// You will get these from your Supabase project settings.
// We will store them securely on Render in the next part.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
const PORT = 3000;
const ADMIN_PASSWORD = 'your-very-secret-password'; // 🔒 IMPORTANT: Change this!

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Authentication middleware
const requireAuth = (req, res, next) => {
    const password = req.headers['x-admin-password'];
    if (password && password === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized: Admin password required.' });
    }
};

// --- API ROUTES ---

// [PUBLIC] Gets all photos from the Supabase database
app.get('/api/photos', async (req, res) => {
    const { data, error } = await supabase
        .from('photos')
        .select('*');

    if (error) {
        return res.status(500).json({ message: 'Error fetching photos.', error });
    }
    res.json(data);
});

// [PROTECTED] Adds new photos to the Supabase database
app.post('/api/photos', requireAuth, async (req, res) => {
    const newPhotos = req.body; // Expecting an array of photo objects
    const { data, error } = await supabase
        .from('photos')
        .insert(newPhotos);
    
    if (error) {
        return res.status(500).json({ message: 'Error saving photos.', error });
    }
    res.status(201).json({ message: 'Photos added successfully.' });
});

// [PROTECTED] Deletes all photos from the Supabase database
app.delete('/api/photos', requireAuth, async (req, res) => {
    const { data, error } = await supabase
        .from('photos')
        .delete()
        .gt('id', 0); // Deletes all rows

    if (error) {
        return res.status(500).json({ message: 'Error deleting photos.', error });
    }
    res.status(200).json({ message: 'All photos deleted successfully.' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});