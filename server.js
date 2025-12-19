// server.js - Backend con SQLite COMPLETO
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - IMPORTANTE: debe estar ANTES de las rutas
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3002', 
    'http://localhost:3003',
    'https://tienda-online-ivory-one.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de base de datos - usar /tmp en Railway
const DB_PATH = process.env.RAILWAY_ENVIRONMENT 
  ? '/tmp/tienda.db' 
  : './tienda.db';

// Crear/conectar base de datos
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err);
  } else {
    console.log('✅ Base de datos SQLite conectada en:', DB_PATH);
    inicializarDB();
  }
});

// Crear tablas si no existen - CON CALLBACKS ENCADENADOS
function inicializarDB() {
  // Tabla usuarios
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT UNIQUE NOT NULL,
    pwd TEXT NOT NULL,
    tipo TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.error('Error creando tabla usuarios:', err);
      return;
    }
    console.log('✅ Tabla usuarios creada/verificada');
    
    // Tabla productos (después de usuarios)
    db.run(`CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL,
      stock INTEGER NOT NULL,
      precio REAL NOT NULL,
      fotos TEXT NOT NULL,
      categoria TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error('Error creando tabla productos:', err);
        return;
      }
      console.log('✅ Tabla productos creada/verificada');
      
      // Tabla pedidos (después de productos)
      db.run(`CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fechaPedido TEXT NOT NULL,
        precioTotal REAL NOT NULL,
        descripcion TEXT NOT NULL,
        productos TEXT NOT NULL
      )`, (err) => {
        if (err) {
          console.error('Error creando tabla pedidos:', err);
          return;
        }
        console.log('✅ Tabla pedidos creada/verificada');
        
        // AHORA SÍ verificar y cargar datos (después de crear TODAS las tablas)
        verificarYCargarDatos();
      });
    });
  });
}

// Verificar si hay datos y cargarlos si es necesario
function verificarYCargarDatos() {
  db.get('SELECT COUNT(*) as count FROM usuarios', (err, row) => {
    if (err) {
      console.error('Error verificando usuarios:', err);
      return;
    }
    
    if (row && row.count === 0) {
      console.log('🔥 Base de datos vacía, cargando datos iniciales...');
      cargarDatosIniciales();
    } else {
      console.log(`✅ Base de datos ya tiene ${row.count} usuarios`);
    }
  });
}

// Cargar datos iniciales desde JSON
function cargarDatosIniciales() {
  const fs = require('fs');
  
  try {
    // Cargar usuarios
    const usuariosPath = path.join(__dirname, 'public', 'usuarios.json');
    if (fs.existsSync(usuariosPath)) {
      const usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf8'));
      usuarios.forEach(u => {
        db.run('INSERT OR IGNORE INTO usuarios (usuario, pwd, tipo) VALUES (?, ?, ?)',
          [u.usuario, u.pwd, u.tipo],
          (err) => {
            if (err) console.error('Error insertando usuario:', err);
          });
      });
      console.log(`✅ ${usuarios.length} usuarios cargados`);
    } else {
      // Si no hay archivo, crear usuarios por defecto
      console.log('⚠️ Archivo usuarios.json no encontrado, creando usuarios por defecto');
      const usuariosDefault = [
        { usuario: 'admin', pwd: 'admin', tipo: 'admin' },
        { usuario: 'cliente', pwd: 'cliente', tipo: 'cliente' }
      ];
      usuariosDefault.forEach(u => {
        db.run('INSERT OR IGNORE INTO usuarios (usuario, pwd, tipo) VALUES (?, ?, ?)',
          [u.usuario, u.pwd, u.tipo]);
      });
    }

    // Cargar productos
    const productosPath = path.join(__dirname, 'public', 'productos.json');
    if (fs.existsSync(productosPath)) {
      const productos = JSON.parse(fs.readFileSync(productosPath, 'utf8'));
      productos.forEach(p => {
        db.run('INSERT OR IGNORE INTO productos (nombre, stock, precio, fotos, categoria) VALUES (?, ?, ?, ?, ?)',
          [p.nombre, p.stock, p.precio, JSON.stringify(p.fotos), p.categoria],
          (err) => {
            if (err) console.error('Error insertando producto:', err);
          });
      });
      console.log(`✅ ${productos.length} productos cargados`);
    } else {
      console.log('⚠️ Archivo productos.json no encontrado');
    }

    // Cargar pedidos si existen
    const pedidosPath = path.join(__dirname, 'public', 'pedidos.json');
    if (fs.existsSync(pedidosPath)) {
      const pedidos = JSON.parse(fs.readFileSync(pedidosPath, 'utf8'));
      pedidos.forEach(p => {
        db.run('INSERT OR IGNORE INTO pedidos (id, fechaPedido, precioTotal, descripcion, productos) VALUES (?, ?, ?, ?, ?)',
          [p.id, p.fechaPedido, p.precioTotal, p.descripcion, JSON.stringify(p.productos)],
          (err) => {
            if (err) console.error('Error insertando pedido:', err);
          });
      });
      console.log(`✅ ${pedidos.length} pedidos cargados`);
    } else {
      console.log('ℹ️ No hay pedidos previos (pedidos.json no encontrado)');
    }
  } catch (error) {
    console.error('❌ Error cargando datos iniciales:', error);
  }
}

// ==================== RUTAS API ====================

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend funcionando correctamente',
    database: DB_PATH
  });
});

// ========== USUARIOS ==========

// GET - Obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
  db.all('SELECT * FROM usuarios', [], (err, rows) => {
    if (err) {
      console.error('Error obteniendo usuarios:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST - Crear usuario
app.post('/api/usuarios', (req, res) => {
  const { usuario, pwd, tipo } = req.body;
  
  if (!usuario || !pwd || !tipo) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  
  db.run(
    'INSERT INTO usuarios (usuario, pwd, tipo) VALUES (?, ?, ?)',
    [usuario, pwd, tipo],
    function(err) {
      if (err) {
        console.error('Error creando usuario:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log(`✅ Usuario creado con ID: ${this.lastID}`);
      res.json({ id: this.lastID, usuario, pwd, tipo, success: true });
    }
  );
});

// PUT - Actualizar usuario
app.put('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { usuario, pwd, tipo } = req.body;
  
  if (!usuario || !pwd || !tipo) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  
  db.run(
    'UPDATE usuarios SET usuario = ?, pwd = ?, tipo = ? WHERE id = ?',
    [usuario, pwd, tipo, id],
    function(err) {
      if (err) {
        console.error('Error actualizando usuario:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log(`✅ Usuario ${id} actualizado`);
      res.json({ success: true, changes: this.changes });
    }
  );
});

// DELETE - Eliminar usuario
app.delete('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM usuarios WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error eliminando usuario:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log(`✅ Usuario ${id} eliminado`);
    res.json({ success: true, changes: this.changes });
  });
});

// ========== PRODUCTOS ==========

// GET - Obtener todos los productos
app.get('/api/productos', (req, res) => {
  db.all('SELECT * FROM productos', [], (err, rows) => {
    if (err) {
      console.error('Error obteniendo productos:', err);
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

// POST - Crear producto
app.post('/api/productos', (req, res) => {
  const { nombre, stock, precio, fotos, categoria } = req.body;
  
  if (!nombre || stock === undefined || precio === undefined || !categoria) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  
  db.run(
    'INSERT INTO productos (nombre, stock, precio, fotos, categoria) VALUES (?, ?, ?, ?, ?)',
    [nombre, stock, precio, JSON.stringify(fotos || []), categoria],
    function(err) {
      if (err) {
        console.error('Error creando producto:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log(`✅ Producto creado: ${nombre}`);
      res.json({ id: this.lastID, nombre, stock, precio, fotos, categoria, success: true });
    }
  );
});

// PUT - Actualizar producto individual
app.put('/api/productos/:nombre', (req, res) => {
  const nombre = decodeURIComponent(req.params.nombre);
  const { stock, precio, categoria, fotos } = req.body;
  
  // Si solo viene stock (actualización de compra)
  if (stock !== undefined && !precio && !categoria) {
    db.run(
      'UPDATE productos SET stock = ? WHERE nombre = ?',
      [stock, nombre],
      function(err) {
        if (err) {
          console.error('Error actualizando stock:', err);
          return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Stock actualizado para: ${nombre}`);
        res.json({ success: true, changes: this.changes });
      }
    );
  } else {
    // Actualización completa del producto
    db.run(
      'UPDATE productos SET stock = ?, precio = ?, categoria = ?, fotos = ? WHERE nombre = ?',
      [stock, precio, categoria, JSON.stringify(fotos || []), nombre],
      function(err) {
        if (err) {
          console.error('Error actualizando producto:', err);
          return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Producto actualizado: ${nombre}`);
        res.json({ success: true, changes: this.changes });
      }
    );
  }
});

// PUT - Actualizar múltiples productos (para compras)
app.put('/api/productos', (req, res) => {
  const productos = req.body;
  
  if (!Array.isArray(productos)) {
    return res.status(400).json({ error: 'Se esperaba un array de productos' });
  }
  
  const stmt = db.prepare('UPDATE productos SET stock = ? WHERE nombre = ?');
  
  productos.forEach(p => {
    stmt.run([p.stock, p.nombre]);
  });
  
  stmt.finalize((err) => {
    if (err) {
      console.error('Error actualizando productos:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('✅ Stock de productos actualizado');
    res.json({ success: true });
  });
});

// DELETE - Eliminar producto
app.delete('/api/productos/:nombre', (req, res) => {
  const nombre = decodeURIComponent(req.params.nombre);
  
  db.run('DELETE FROM productos WHERE nombre = ?', [nombre], function(err) {
    if (err) {
      console.error('Error eliminando producto:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log(`✅ Producto ${nombre} eliminado`);
    res.json({ success: true, changes: this.changes });
  });
});

// ========== PEDIDOS ==========

// GET - Obtener todos los pedidos
app.get('/api/pedidos', (req, res) => {
  db.all('SELECT * FROM pedidos', [], (err, rows) => {
    if (err) {
      console.error('Error obteniendo pedidos:', err);
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

// PUT - Actualizar pedido
app.put('/api/pedidos/:id', (req, res) => {
  const { id } = req.params;
  const { fechaPedido, precioTotal, descripcion, productos } = req.body;
  
  if (!fechaPedido || !precioTotal || !descripcion || !productos) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  
  db.run(
    'UPDATE pedidos SET fechaPedido = ?, precioTotal = ?, descripcion = ?, productos = ? WHERE id = ?',
    [fechaPedido, precioTotal, descripcion, JSON.stringify(productos), id],
    function(err) {
      if (err) {
        console.error('Error actualizando pedido:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log(`✅ Pedido ${id} actualizado`);
      res.json({ success: true, changes: this.changes });
    }
  );
});

// DELETE - Eliminar pedido
app.delete('/api/pedidos/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM pedidos WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error eliminando pedido:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log(`✅ Pedido ${id} eliminado`);
    res.json({ success: true, changes: this.changes });
  });
});

// ==================== MANEJO DE ERRORES ====================

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware para errores generales
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Cerrar base de datos cuando se cierra el servidor
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error cerrando base de datos:', err);
    } else {
      console.log('✅ Base de datos cerrada');
    }
    process.exit(0);
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend con SQLite corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: ${DB_PATH}`);
  console.log(`🌍 Ambiente: ${process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 'Local'}`);
});