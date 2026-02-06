// server.js
// Backend básico Express para Railway con PostgreSQL
const express = require('express');
const cors = require('cors');
const db = require('./db');


const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure 'items' table exists on startup
async function ensureTables() {
    try {
        await db.query(`CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL
        );`);
        console.log('Table "items" is ready.');
    } catch (err) {
        console.error('Error creating table:', err);
    }
}
ensureTables();


app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ejemplo: tabla "items" (id serial, name text)
app.get('/api/items', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM items ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/items', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    try {
        const result = await db.query('INSERT INTO items(name) VALUES($1) RETURNING *', [name]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
