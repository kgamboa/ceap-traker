const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes/index');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del cliente (en producción)
const clientPath = path.join(__dirname, '../../client/build');
app.use(express.static(clientPath));

// Rutas API
app.use('/api', routes);

// Servir el cliente para todas las rutas que no sean API
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientPath, 'index.html'), (err) => {
      if (err) {
        res.status(404).json({ error: 'Página no encontrada' });
      }
    });
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor CEaP Tracker ejecutándose en puerto ${PORT}`);
});
