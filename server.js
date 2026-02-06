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
            plantel TEXT NOT NULL,
            ciclo_ceap TEXT,
            fase TEXT,
            estatus TEXT,
            observaciones TEXT,
            fecha_estimada DATE,
            fecha_concluido DATE
        );`);
        console.log('Table "items" (actualizada) is ready.');
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

// Obtener todos los items
app.get('/api/items', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM items ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear un nuevo item
app.post('/api/items', async (req, res) => {
    const { plantel, ciclo_ceap, fase, estatus, observaciones, fecha_estimada, fecha_concluido } = req.body;
    if (!plantel) return res.status(400).json({ error: 'Plantel requerido' });
    try {
        const result = await db.query(
            `INSERT INTO items (plantel, ciclo_ceap, fase, estatus, observaciones, fecha_estimada, fecha_concluido)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [plantel, ciclo_ceap, fase, estatus, observaciones, fecha_estimada, fecha_concluido]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
