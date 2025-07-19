// server.js - Updated with Edit and Delete Routes

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
const PORT = 3000;
const ADMIN_PASSWORD = 'Melzkhie@35653';

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

// --- PHOTO API ROUTES ---
app.get('/api/photos', async (req, res) => { /* ...your existing photo code... */ });
app.post('/api/photos', requireAuth, async (req, res) => { /* ...your existing photo code... */ });
app.delete('/api/photos', requireAuth, async (req, res) => { /* ...your existing photo code... */ });


// --- ARTICLE API ROUTES ---

// [PUBLIC] Gets all articles
app.get('/api/articles', async (req, res) => {
    const { data, error } = await supabase
        .from('articles')
        .select('id, title, content, author, published_date, image_url')
        .order('published_date', { ascending: false });

    if (error) {
        return res.status(500).json({ message: 'Error fetching articles.', error });
    }
    res.json(data);
});

// [PUBLIC] Gets a SINGLE article by its ID
app.get('/api/articles/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('articles').select('*').eq('id', id).single();
    if (error) { return res.status(500).json({ message: 'Error fetching article.', error }); }
    if (!data) { return res.status(404).json({ message: 'Article not found.' }); }
    res.json(data);
});

// [PROTECTED] Creates a new article
app.post('/api/articles', requireAuth, async (req, res) => {
    const { title, content, author, published_date, image_url } = req.body;
    const { data, error } = await supabase.from('articles').insert([{ title, content, author, published_date, image_url }]).select();
    if (error) { return res.status(500).json({ message: 'Error creating article.', error }); }
    res.status(201).json({ message: 'Article created successfully.', article: data });
});

// --- NEW ROUTES FOR EDIT AND DELETE ---

// [PROTECTED] Updates an existing article
app.put('/api/articles/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { title, content, author, image_url } = req.body;
    const { data, error } = await supabase
        .from('articles')
        .update({ title, content, author, image_url })
        .eq('id', id);
    if (error) { return res.status(500).json({ message: 'Error updating article.', error }); }
    res.status(200).json({ message: 'Article updated successfully.' });
});

// [PROTECTED] Deletes an article
app.delete('/api/articles/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
    if (error) { return res.status(500).json({ message: 'Error deleting article.', error }); }
    res.status(200).json({ message: 'Article deleted successfully.' });
});


// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});