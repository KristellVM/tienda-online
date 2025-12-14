// server.js - Backend con SQLite
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - IMPORTANTE: debe estar ANTES de las rutas
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Crear/conectar base de datos
const db = new sqlite3.Database('./tienda.db', (err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err);
  } else {
    console.log('✅ Base de datos SQLite conectada');
    inicializarDB();
  }
});

// Crear tablas si no existen
function inicializarDB() {
  // Tabla usuarios
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT UNIQUE NOT NULL,
    pwd TEXT NOT NULL,
    tipo TEXT NOT NULL
  )`);

  // Tabla productos
  db.run(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    stock INTEGER NOT NULL,
    precio REAL NOT NULL,
    fotos TEXT NOT NULL,
    categoria TEXT NOT NULL
  )`);

  // Tabla pedidos
  db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fechaPedido TEXT NOT NULL,
    precioTotal REAL NOT NULL,
    descripcion TEXT NOT NULL,
    productos TEXT NOT NULL
  )`);

  // Verificar si hay datos, si no, cargar datos iniciales
  db.get('SELECT COUNT(*) as count FROM usuarios', (err, row) => {
    if (err) {
      console.error('Error verificando usuarios:', err);
      return;
    }
    if (row && row.count === 0) {
      cargarDatosIniciales();
    }
  });
}

// Cargar datos iniciales desde JSON
function cargarDatosIniciales() {
  const fs = require('fs');
  
  // Cargar usuarios
  const usuarios = JSON.parse(fs.readFileSync('./public/usuarios.json', 'utf8'));
  usuarios.forEach(u => {
    db.run('INSERT OR IGNORE INTO usuarios (usuario, pwd, tipo) VALUES (?, ?, ?)',
      [u.usuario, u.pwd, u.tipo]);
  });

  // Cargar productos
  const productos = JSON.parse(fs.readFileSync('./public/productos.json', 'utf8'));
  productos.forEach(p => {
    db.run('INSERT OR IGNORE INTO productos (nombre, stock, precio, fotos, categoria) VALUES (?, ?, ?, ?, ?)',
      [p.nombre, p.stock, p.precio, JSON.stringify(p.fotos), p.categoria]);
  });

  // Cargar pedidos si existen
  try {
    const pedidos = JSON.parse(fs.readFileSync('./public/pedidos.json', 'utf8'));
    pedidos.forEach(p => {
      db.run('INSERT OR IGNORE INTO pedidos (id, fechaPedido, precioTotal, descripcion, productos) VALUES (?, ?, ?, ?, ?)',
        [p.id, p.fechaPedido, p.precioTotal, p.descripcion, JSON.stringify(p.productos)]);
    });
  } catch (e) {
    console.log('ℹ️ No hay pedidos previos');
  }

  console.log('✅ Datos iniciales cargados en la base de datos');
}

// ==================== RUTAS API ====================

// GET - Obtener usuarios
app.get('/api/usuarios', (req, res) => {
  db.all('SELECT * FROM usuarios', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET - Obtener productos
app.get('/api/productos', (req, res) => {
  db.all('SELECT * FROM productos', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Parsear fotos de JSON string a array
    const productos = rows.map(p => ({
      ...p,
      fotos: JSON.parse(p.fotos)
    }));
    res.json(productos);
  });
});

// GET - Obtener pedidos
app.get('/api/pedidos', (req, res) => {
  db.all('SELECT * FROM pedidos', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Parsear productos de JSON string a array
    const pedidos = rows.map(p => ({
      ...p,
      productos: JSON.parse(p.productos)
    }));
    res.json(pedidos);
  });
});

// POST - Crear pedido
app.post('/api/pedidos', (req, res) => {
  console.log('📦 Pedido recibido:', req.body);
  
  const pedido = req.body;
  
  if (!pedido || !pedido.fechaPedido) {
    console.error('❌ Datos del pedido inválidos:', pedido);
    return res.status(400).json({ error: 'Datos del pedido inválidos' });
  }
  
  db.run(
    'INSERT INTO pedidos (fechaPedido, precioTotal, descripcion, productos) VALUES (?, ?, ?, ?)',
    [pedido.fechaPedido, pedido.precioTotal, pedido.descripcion, JSON.stringify(pedido.productos)],
    function(err) {
      if (err) {
        console.error('❌ Error insertando pedido:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log(`✅ Nuevo pedido creado con ID: ${this.lastID}`);
      res.json({ id: this.lastID, success: true });
    }
  );
});

// PUT - Actualizar stock de producto
app.put('/api/productos/:nombre', (req, res) => {
  const { nombre } = req.params;
  const { stock } = req.body;
  
  db.run(
    'UPDATE productos SET stock = ? WHERE nombre = ?',
    [stock, nombre],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      console.log(`✅ Stock actualizado para: ${nombre}`);
      res.json({ success: true, changes: this.changes });
    }
  );
});

// PUT - Actualizar múltiples productos (para compras)
app.put('/api/productos', (req, res) => {
  const productos = req.body;
  
  const stmt = db.prepare('UPDATE productos SET stock = ? WHERE nombre = ?');
  
  productos.forEach(p => {
    stmt.run([p.stock, p.nombre]);
  });
  
  stmt.finalize((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log('✅ Stock de productos actualizado');
    res.json({ success: true });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend con SQLite corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: tienda.db`);
});