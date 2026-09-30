const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connection Pool a MySQL
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'assetflow_ti'
});

// Listar todos los equipos
app.get('/api/equipos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM equipos ORDER BY id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar un equipo nuevo
app.post('/api/equipos', async (req, res) => {
  try {
    const { nombre } = req.body;
    await db.query('INSERT INTO equipos (nombre) VALUES (?)', [nombre]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Prestar un equipo
app.post('/api/equipos/:id/prestar', async (req, res) => {
  try {
    const { empleado, fecha_limite } = req.body;
    await db.query(
      `UPDATE equipos SET empleado = ?, fecha_prestamo = CURDATE(),
       fecha_limite = ?, estado = 'prestado' WHERE id = ?`,
      [empleado, fecha_limite, req.params.id]
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Devolver un equipo
app.post('/api/equipos/:id/devolver', async (req, res) => {
  try {
    await db.query(
      `UPDATE equipos SET empleado = NULL, fecha_prestamo = NULL,
       fecha_limite = NULL, estado = 'disponible' WHERE id = ?`,
      [req.params.id]
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`¡Servidor activo! Entra a: http://localhost:${PORT}`);
});