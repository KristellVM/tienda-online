import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Menu,
  X,
  LogOut,
  Search,
  Users,
  Package,
} from "lucide-react";

// URL del backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Servicio para conectar con la base de datos
const DataService = {
  async cargarUsuarios() {
    try {
      const response = await fetch(`${API_URL}/api/usuarios`);
      if (!response.ok) throw new Error("Error cargando usuarios");
      const datos = await response.json();
      console.log("✅ Usuarios cargados desde BD:", datos);
      return datos;
    } catch (error) {
      console.error("❌ Error cargando usuarios:", error);
      return [];
    }
  },

  async cargarProductos() {
    try {
      const response = await fetch(`${API_URL}/api/productos`);
      if (!response.ok) throw new Error("Error cargando productos");
      const datos = await response.json();
      console.log("✅ Productos cargados desde BD:", datos);
      return datos;
    } catch (error) {
      console.error("❌ Error cargando productos:", error);
      return [];
    }
  },

  async cargarPedidos() {
    try {
      const response = await fetch(`${API_URL}/api/pedidos`);
      if (!response.ok) throw new Error("Error cargando pedidos");
      const datos = await response.json();
      console.log("✅ Pedidos cargados desde BD:", datos);
      return datos;
    } catch (error) {
      console.error("❌ Error cargando pedidos:", error);
      return [];
    }
  },

  async crearPedido(pedido) {
    try {
      const response = await fetch(`${API_URL}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      });

      if (!response.ok) throw new Error("Error creando pedido");
      const resultado = await response.json();
      console.log("💾 Pedido guardado en BD:", resultado);
      return resultado;
    } catch (error) {
      console.error("❌ Error guardando pedido:", error);
      return null;
    }
  },

  async actualizarProductos(productos) {
    try {
      const response = await fetch(`${API_URL}/api/productos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productos),
      });

      if (!response.ok) throw new Error("Error actualizando productos");
      console.log("💾 Productos actualizados en BD");
      return true;
    } catch (error) {
      console.error("❌ Error actualizando productos:", error);
      return false;
    }
  },

  async actualizarPedido(pedido) {
    try {
      const response = await fetch(`${API_URL}/api/pedidos/${pedido.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      });

      if (!response.ok) throw new Error("Error actualizando pedido");
      console.log("💾 Pedido actualizado en BD");
      return true;
    } catch (error) {
      console.error("❌ Error actualizando pedido:", error);
      return false;
    }
  },

  async eliminarPedido(id) {
    try {
      const response = await fetch(`${API_URL}/api/pedidos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error eliminando pedido");
      console.log("💾 Pedido eliminado de BD");
      return true;
    } catch (error) {
      console.error("❌ Error eliminando pedido:", error);
      return false;
    }
  },

  async crearUsuario(usuario) {
    try {
      const response = await fetch(`${API_URL}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });

      if (!response.ok) throw new Error("Error creando usuario");
      const resultado = await response.json();
      console.log("💾 Usuario creado en BD:", resultado);
      return resultado;
    } catch (error) {
      console.error("❌ Error creando usuario:", error);
      return null;
    }
  },

  async actualizarUsuario(usuario, id) {
    try {
      const response = await fetch(`${API_URL}/api/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });

      if (!response.ok) throw new Error("Error actualizando usuario");
      console.log("💾 Usuario actualizado en BD");
      return true;
    } catch (error) {
      console.error("❌ Error actualizando usuario:", error);
      return false;
    }
  },

  async eliminarUsuario(id) {
    try {
      const response = await fetch(`${API_URL}/api/usuarios/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error eliminando usuario");
      console.log("💾 Usuario eliminado de BD");
      return true;
    } catch (error) {
      console.error("❌ Error eliminando usuario:", error);
      return false;
    }
  },
  async crearProducto(producto) {
  try {
    const response = await fetch(`${API_URL}/api/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });
    if (!response.ok) throw new Error("Error creando producto");
    const resultado = await response.json();
    console.log("💾 Producto creado en BD:", resultado);
    return resultado;
  } catch (error) {
    console.error("❌ Error creando producto:", error);
    return null;
  }
},

async eliminarProducto(nombre) {
  try {
    const response = await fetch(`${API_URL}/api/productos/${encodeURIComponent(nombre)}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error eliminando producto");
    console.log("💾 Producto eliminado de BD");
    return true;
  } catch (error) {
    console.error("❌ Error eliminando producto:", error);
    return false;
  }
},
};

// Componente Login
const Login = ({ onLogin, usuarios }) => {
  const [usuario, setUsuario] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const usuarioEncontrado = usuarios.find(
      (u) => u.usuario === usuario && u.pwd === pwd
    );

    if (usuarioEncontrado) {
      if (
        usuarioEncontrado.tipo === "cliente" ||
        usuarioEncontrado.tipo === "admin"
      ) {
        onLogin(usuarioEncontrado);
      } else {
        setError("Tipo de usuario no válido");
      }
    } else {
      setError("Contraseña o nombre de usuario incorrecto");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Marca</h1>
        {error && (
          <p className="text-red-500 text-center mb-4 text-sm">{error}</p>
        )}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
          >
            INICIAR SESIÓN
          </button>
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Usuario: cliente | Contraseña: cliente</p>
          <p>Usuario: admin | Contraseña: admin</p>
        </div>
      </div>
    </div>
  );
};

// Componente MenuLateral
const MenuLateral = ({ onClose, onFilterCategoria, onMostrarTodos }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={onClose}
    >
      <div
        className="bg-white w-64 h-full shadow-lg p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="font-bold text-xl hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => {
              onMostrarTodos();
              onClose();
            }}
            className="font-bold hover:text-gray-600 block w-full text-left text-sm"
          >
            TODOS
          </button>
          <button
            onClick={() => {
              onFilterCategoria("mujer");
              onClose();
            }}
            className="font-bold hover:text-gray-600 block w-full text-left text-sm"
          >
            MUJER
          </button>
          <button
            onClick={() => {
              onFilterCategoria("hombre");
              onClose();
            }}
            className="font-bold hover:text-gray-600 block w-full text-left text-sm"
          >
            HOMBRE
          </button>

          <hr className="my-4" />

          <div className="space-y-2 text-gray-700 text-sm">
            <p className="font-bold">NOVEDADES</p>
            <p className="font-bold">PROMOCIONES</p>
            <hr />
            <p className="hover:text-gray-500 cursor-pointer">Camisetas</p>
            <p className="hover:text-gray-500 cursor-pointer">Sudaderas</p>
            <p className="hover:text-gray-500 cursor-pointer">Pantalones</p>
            <p className="hover:text-gray-500 cursor-pointer">Jeans</p>
            <p className="hover:text-gray-500 cursor-pointer">Abrigos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Panel Admin
const PanelAdmin = ({ onGestionPedidos, onGestionUsuarios, onGestionProductos, onLogout }) => {  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">
            Panel de Administración
          </h1>
          <button onClick={onLogout} className="hover:text-gray-600">
            <LogOut size={22} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div
            onClick={onGestionPedidos}
            className="bg-white rounded-lg shadow-md p-8 cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center space-y-4">
              <Package size={64} className="text-blue-600" />
              <h2 className="text-xl font-bold">Gestión de Pedidos</h2>
              <p className="text-gray-600 text-center">
                Ver, editar y eliminar pedidos
              </p>
            </div>
          </div>

          <div
            onClick={onGestionUsuarios}
            className="bg-white rounded-lg shadow-md p-8 cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center space-y-4">
              <Users size={64} className="text-green-600" />
              <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
              <p className="text-gray-600 text-center">
                Crear, editar y eliminar usuarios
              </p>
            </div>
          </div>
          <div
            onClick={onGestionProductos}
            className="bg-white rounded-lg shadow-md p-8 cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center space-y-4">
              <Package size={64} className="text-purple-600" />
              <h2 className="text-xl font-bold text-center">Gestión de Productos</h2>
              <p className="text-gray-600 text-center">
                Crear, editar y eliminar productos
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Componente Formulario de Edición de Pedido
const FormularioPedido = ({ pedido, onGuardar, onCancelar }) => {
  const [id, setId] = useState(pedido?.id || "");
  const [fecha, setFecha] = useState(pedido?.fechaPedido || "");
  const [precio, setPrecio] = useState(pedido?.precioTotal || "");
  const [descripcion, setDescripcion] = useState(pedido?.descripcion || "");
  const [error, setError] = useState("");

  const handleGuardar = () => {
    if (!id || !fecha || !precio) {
      setError("Los campos no pueden estar vacíos");
      return;
    }

    const pedidoNuevo = {
      id: parseInt(id),
      fechaPedido: fecha,
      precioTotal: parseFloat(precio),
      descripcion: descripcion,
      productos: pedido?.productos || [],
    };

    onGuardar(pedidoNuevo);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Editar Pedido</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              ID del Pedido
            </label>
            <input
              type="number"
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={pedido?.id}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Fecha del Pedido
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Precio Total (€)
            </label>
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleGuardar}
              className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800 transition"
            >
              Guardar
            </button>
            <button
              onClick={onCancelar}
              className="flex-1 border-2 border-red-500 text-red-500 py-2 rounded hover:bg-red-50 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Gestión de Pedidos 
const GestionPedidos = ({ pedidos, onVolver, onActualizar }) => {
  const [vistaFormulario, setVistaFormulario] = useState(false);
  const [pedidoEditar, setPedidoEditar] = useState(null);
  const [mostrarPopupEliminar, setMostrarPopupEliminar] = useState(false);
  const [pedidoEliminar, setPedidoEliminar] = useState(null);

  const handleEditar = (pedido) => {
    setPedidoEditar(pedido);
    setVistaFormulario(true);
  };

  const handleGuardar = async (pedidoNuevo) => {
    const exito = await DataService.actualizarPedido(pedidoNuevo);
    if (exito) {
      const pedidosActualizados = pedidos.map(p => 
        p.id === pedidoEditar.id ? pedidoNuevo : p
      );
      onActualizar(pedidosActualizados);
      alert('✅ El pedido se ha guardado correctamente');
      setVistaFormulario(false);
    } else {
      alert('❌ Error al guardar el pedido');
    }
  };

  const confirmarEliminar = (pedido) => {
    setPedidoEliminar(pedido);
    setMostrarPopupEliminar(true);
  };

  const handleEliminar = async () => {
    const exito = await DataService.eliminarPedido(pedidoEliminar.id);
    if (exito) {
      const pedidosActualizados = pedidos.filter(p => p.id !== pedidoEliminar.id);
      onActualizar(pedidosActualizados);
      alert('✅ Pedido eliminado correctamente');
    } else {
      alert('❌ Error al eliminar el pedido');
    }
    setMostrarPopupEliminar(false);
    setPedidoEliminar(null);
  };

  if (vistaFormulario) {
    return (
      <FormularioPedido
        pedido={pedidoEditar}
        onGuardar={handleGuardar}
        onCancelar={() => setVistaFormulario(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">Gestión de Pedidos</h1>
          <button
            onClick={onVolver}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm"
          >
            Atrás
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Fecha Pedido</th>
                  <th className="px-4 py-3 text-left font-semibold">Precio Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Descripción</th>
                  <th className="px-4 py-3 text-center font-semibold">Editar</th>
                  <th className="px-4 py-3 text-center font-semibold">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{pedido.id}</td>
                    <td className="px-4 py-3">{pedido.fechaPedido}</td>
                    <td className="px-4 py-3">{pedido.precioTotal.toFixed(2)}€</td>
                    <td className="px-4 py-3 max-w-xs truncate">{pedido.descripcion}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEditar(pedido)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Editar
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => confirmarEliminar(pedido)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {mostrarPopupEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar borrado</h3>
            <p className="mb-6">¿Desea borrar el pedido #{pedidoEliminar?.id}?</p>
            <div className="flex space-x-3">
              <button
                onClick={handleEliminar}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Eliminar
              </button>
              <button
                onClick={() => setMostrarPopupEliminar(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Catálogo
const Catalogo = ({
  productos,
  onVerDetalles,
  carrito,
  onVerCarrito,
  onLogout,
}) => {
  const [productosFiltrados, setProductosFiltrados] = useState(productos);
  const [menuVisible, setMenuVisible] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    setProductosFiltrados(productos);
  }, [productos]);

  const filtrarPorCategoria = (categoria) => {
    const filtrados = productos.filter((p) => p.categoria === categoria);
    setProductosFiltrados(filtrados);
    setBusqueda("");
  };

  const mostrarTodos = () => {
    setProductosFiltrados(productos);
    setBusqueda("");
  };

  const handleBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    if (valor.trim() === "") {
      setProductosFiltrados(productos);
    } else {
      const filtrados = productos.filter((p) =>
        p.nombre.toLowerCase().includes(valor.toLowerCase())
      );
      setProductosFiltrados(filtrados);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setMenuVisible(true)}
            className="flex items-center space-x-2 hover:text-gray-600"
          >
            <Menu size={20} />
            <span className="text-sm">Menu</span>
          </button>

          <h1 className="text-xl md:text-2xl font-bold">Marca</h1>

          <div className="flex items-center space-x-3">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Buscar..."
                value={busqueda}
                onChange={handleBusqueda}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black w-48"
              />
              <Search
                className="absolute right-2 top-2 text-gray-400"
                size={16}
              />
            </div>
            <button
              onClick={onVerCarrito}
              className="relative hover:text-gray-600"
            >
              <ShoppingCart size={22} />
              {carrito.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {carrito.length}
                </span>
              )}
            </button>
            <button onClick={onLogout} className="hover:text-gray-600">
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {productosFiltrados.length === 0 ? (
          <p className="text-center text-gray-500 text-lg mt-10">
            No se encuentran productos
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {productosFiltrados.map((producto, index) => (
              <div
                key={index}
                onClick={() => onVerDetalles(producto)}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="h-48 md:h-72 bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      producto.fotos && producto.fotos[0]
                        ? `/imagenes/${producto.fotos[0]}`
                        : `https://via.placeholder.com/300x400?text=${encodeURIComponent(
                            producto.nombre
                          )}`
                    }
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/300x400?text=${encodeURIComponent(
                        producto.nombre
                      )}`;
                    }}
                  />
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-semibold text-sm md:text-base mb-1 truncate">
                    {producto.nombre}
                  </h3>
                  <p className="text-gray-700 font-medium text-sm md:text-base">
                    {producto.precio.toFixed(2)}€
                  </p>
                  <p
                    className={`text-xs ${
                      producto.stock > 5 ? "text-gray-500" : "text-red-500"
                    }`}
                  >
                    Stock: {producto.stock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {menuVisible && (
        <MenuLateral
          onClose={() => setMenuVisible(false)}
          onFilterCategoria={filtrarPorCategoria}
          onMostrarTodos={mostrarTodos}
        />
      )}
    </div>
  );
};

// Componente Detalles del Producto
const DetallesProducto = ({ producto, onAgregarCarrito, onVolver }) => {
  const [agregado, setAgregado] = useState(false);

  const handleAgregar = () => {
    if (producto.stock > 0) {
      onAgregarCarrito(producto);
      setAgregado(true);
      setTimeout(() => setAgregado(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onVolver}
            className="text-xl md:text-2xl font-bold cursor-pointer hover:text-gray-600"
          >
            ← Marca
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="flex items-center justify-center bg-gray-200 rounded-lg h-64 md:h-96">
              <img
                src={
                  producto.fotos && producto.fotos[0]
                    ? `/imagenes/${producto.fotos[0]}`
                    : `https://via.placeholder.com/400x500?text=${encodeURIComponent(
                        producto.nombre
                      )}`
                }
                alt={producto.nombre}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/400x500?text=${encodeURIComponent(
                    producto.nombre
                  )}`;
                }}
              />
            </div>

            <div className="space-y-4 md:space-y-6">
              <h1 className="text-2xl md:text-3xl font-bold">
                {producto.nombre}
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 font-semibold">
                {producto.precio.toFixed(2)}€
              </p>

              <div>
                <h3 className="font-bold text-base md:text-lg mb-3">Tallas</h3>
                <div className="flex space-x-2 md:space-x-3">
                  {["S", "M", "L", "XL"].map((talla) => (
                    <button
                      key={talla}
                      className="px-3 md:px-4 py-2 border-2 border-black rounded hover:bg-black hover:text-white transition text-sm md:text-base"
                    >
                      {talla}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base md:text-lg mb-3">Colores</h3>
                <div className="flex space-x-3">
                  <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black border-2 border-gray-300 hover:border-black transition"></button>
                  <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-700 border-2 border-gray-300 hover:border-black transition"></button>
                  <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-800 border-2 border-gray-300 hover:border-black transition"></button>
                </div>
              </div>

              <button
                onClick={handleAgregar}
                disabled={agregado || producto.stock === 0}
                className={`w-full py-3 rounded font-bold transition text-sm md:text-base ${
                  agregado
                    ? "bg-green-500 text-white"
                    : producto.stock === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-800 text-white hover:bg-black"
                }`}
              >
                {agregado
                  ? "¡AÑADIDO!"
                  : producto.stock === 0
                  ? "SIN STOCK"
                  : "AÑADIR A LA CESTA"}
              </button>

              <p
                className={`text-sm ${
                  producto.stock > 5
                    ? "text-gray-600"
                    : "text-red-600 font-semibold"
                }`}
              >
                {producto.stock > 0
                  ? `Stock disponible: ${producto.stock} ${
                      producto.stock === 1 ? "unidad" : "unidades"
                    }`
                  : "¡Sin stock disponible!"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Carrito
const Carrito = ({ carrito, onEliminar, onComprar, onVolver }) => {
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [indiceAEliminar, setIndiceAEliminar] = useState(-1);

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.precio, 0);
  };

  const confirmarEliminacion = (indice) => {
    setIndiceAEliminar(indice);
    setMostrarPopup(true);
  };

  const eliminar = () => {
    onEliminar(indiceAEliminar);
    setMostrarPopup(false);
    setIndiceAEliminar(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-2xl w-full relative">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-6">
          Mi carrito
        </h2>

        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {carrito.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              El carrito está vacío
            </p>
          ) : (
            carrito.map((producto, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-100 p-3 md:p-4 rounded"
              >
                <span className="flex-1 text-sm md:text-base">
                  {producto.nombre} - {producto.precio.toFixed(2)}€
                </span>
                <button
                  onClick={() => confirmarEliminacion(index)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 font-bold ml-4 text-sm"
                >
                  X
                </button>
              </div>
            ))
          )}
        </div>

        <div className="text-lg md:text-xl font-semibold mb-6 text-center border-t pt-4">
          Total: {calcularTotal().toFixed(2)}€
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onVolver}
            className="px-4 md:px-6 py-2 border-2 border-black rounded hover:bg-gray-100 transition text-sm md:text-base"
          >
            Volver
          </button>
          <button
            onClick={onComprar}
            disabled={carrito.length === 0}
            className="px-4 md:px-6 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm md:text-base"
          >
            Comprar
          </button>
        </div>

        {mostrarPopup && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl space-y-4 max-w-sm w-full">
              <p className="font-bold text-center text-sm md:text-base">
                ¿Eliminar "{carrito[indiceAEliminar]?.nombre}" del carrito?
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={eliminar}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setMostrarPopup(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Aplicación Principal
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [vista, setVista] = useState("login");
  const [carrito, setCarrito] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);

      try {
        const [productosData, usuariosData, pedidosData] = await Promise.all([
          DataService.cargarProductos(),
          DataService.cargarUsuarios(),
          DataService.cargarPedidos(),
        ]);

        setProductos(productosData || []);
        setUsuarios(usuariosData || []);
        setPedidos(pedidosData || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }

      setCargando(false);
    };

    cargarDatos();
  }, []);

  const handleLogin = (user) => {
    setUsuario(user);
    if (user.tipo === "admin") {
      setVista("admin");
    } else {
      setVista("catalogo");
    }
  };

  const handleLogout = () => {
    if (window.confirm("¿Quiere cerrar sesión?")) {
      setUsuario(null);
      setCarrito([]);
      setVista("login");
    }
  };

  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto]);
  };

  const eliminarDelCarrito = (indice) => {
    setCarrito(carrito.filter((_, i) => i !== indice));
  };

  const comprar = async () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    const total = carrito.reduce((sum, item) => sum + item.precio, 0);

    if (
      window.confirm(
        `¿Realizar pedido?\n\nTotal: ${total.toFixed(
          2
        )}€\n¿Desea confirmar la compra?`
      )
    ) {
      const productosActualizados = productos.map((p) => {
        const cantidadEnCarrito = carrito.filter(
          (c) => c.nombre === p.nombre
        ).length;
        if (cantidadEnCarrito > 0) {
          return { ...p, stock: p.stock - cantidadEnCarrito };
        }
        return p;
      });

      const fecha = new Date().toISOString().split("T")[0];
      const descripcion = carrito.map((p) => p.nombre).join("\n") + "\n";

      const nuevoPedido = {
        fechaPedido: fecha,
        precioTotal: parseFloat(total.toFixed(2)),
        descripcion: descripcion,
        productos: carrito.map((p) => ({
          nombre: p.nombre,
          stock: p.stock,
          precio: p.precio,
          fotos: p.fotos,
          categoria: p.categoria,
        })),
      };

      const resultado = await DataService.crearPedido(nuevoPedido);

      if (resultado && resultado.id) {
        await DataService.actualizarProductos(productosActualizados);

        setProductos(productosActualizados);

        const pedidosActualizados = await DataService.cargarPedidos();
        setPedidos(pedidosActualizados);

        setCarrito([]);

        alert(
          `¡Pedido realizado con éxito!\n\nPedido #${
            resultado.id
          }\nTotal: ${total.toFixed(2)}€`
        );
        setVista("catalogo");
      } else {
        alert("Error al realizar el pedido. Inténtalo de nuevo.");
      }
    }
  };

  const verDetalles = (producto) => {
    setProductoSeleccionado(producto);
    setVista("detalles");
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {vista === "login" && <Login onLogin={handleLogin} usuarios={usuarios} />}

      {vista === "admin" && (
        <PanelAdmin
          onGestionPedidos={() => setVista("gestionPedidos")}
          onGestionUsuarios={() => setVista("gestionUsuarios")}
          onGestionProductos={() => setVista("gestionProductos")}
          onLogout={handleLogout}
        />
      )}
      {vista === 'gestionProductos' && (
  <GestionProductos
    productos={productos}
    onVolver={() => setVista('admin')}
    onActualizar={setProductos}
  />
)}

      {vista === "gestionPedidos" && (
        <GestionPedidos
          pedidos={pedidos}
          onVolver={() => setVista("admin")}
          onActualizar={setPedidos}
        />
      )}

      {vista === "gestionUsuarios" && (
        <GestionUsuarios
          usuarios={usuarios}
          onVolver={() => setVista("admin")}
          onActualizar={setUsuarios}
        />
      )}

      {vista === "catalogo" && (
        <Catalogo
          productos={productos}
          onVerDetalles={verDetalles}
          carrito={carrito}
          onVerCarrito={() => setVista("carrito")}
          onLogout={handleLogout}
        />
      )}

      {vista === "detalles" && productoSeleccionado && (
        <DetallesProducto
          producto={productoSeleccionado}
          onAgregarCarrito={agregarAlCarrito}
          onVolver={() => setVista("catalogo")}
        />
      )}

      {vista === "carrito" && (
        <Carrito
          carrito={carrito}
          onEliminar={eliminarDelCarrito}
          onComprar={comprar}
          onVolver={() => setVista("catalogo")}
        />
      )}
    </div>
  );
}

// Componente Formulario de Edición de Usuario
const FormularioUsuario = ({ usuario, onGuardar, onCancelar }) => {
  const [nombreUsuario, setNombreUsuario] = useState(usuario?.usuario || "");
  const [pwd, setPwd] = useState(usuario?.pwd || "");
  const [tipo, setTipo] = useState(usuario?.tipo || "cliente");
  const [error, setError] = useState("");

  const handleGuardar = () => {
    if (!nombreUsuario.trim() || !pwd.trim()) {
      setError("Los campos no pueden estar vacíos");
      return;
    }

    const usuarioNuevo = {
      usuario: nombreUsuario.trim(),
      pwd: pwd,
      tipo: tipo,
    };

    onGuardar(usuarioNuevo);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {usuario?.usuario ? "Editar Usuario" : "Nuevo Usuario"}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-center">
              Nombre de usuario
            </label>
            <input
              type="text"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black text-center"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-center">
              Contraseña
            </label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black text-center"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-center">
              Tipo
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="admin">Admin</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleGuardar}
              className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800 transition"
            >
              Guardar
            </button>
            <button
              onClick={onCancelar}
              className="flex-1 border-2 border-red-500 text-red-500 py-2 rounded hover:bg-red-50 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// Componente Gestión de Usuarios
const GestionUsuarios = ({ usuarios, onVolver, onActualizar }) => {
  const [vistaFormulario, setVistaFormulario] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarPopupEliminar, setMostrarPopupEliminar] = useState(false);

  const handleAgregar = () => {
    setUsuarioEditar(null);
    setVistaFormulario(true);
  };

  const handleEditar = () => {
    if (!usuarioSeleccionado) {
      alert("⚠️ Por favor, seleccione un usuario de la lista");
      return;
    }
    setUsuarioEditar(usuarioSeleccionado);
    setVistaFormulario(true);
  };

const handleGuardar = async (usuarioNuevo) => {
  if (usuarioEditar) {
    // usar el id, no el nombre
    const exito = await DataService.actualizarUsuario(usuarioNuevo, usuarioEditar.id);
    if (exito) {
      const usuariosActualizados = usuarios.map((u) =>
        u.id === usuarioEditar.id ? { ...usuarioNuevo, id: usuarioEditar.id } : u
      );
      onActualizar(usuariosActualizados);
      alert("✅ El usuario se ha guardado correctamente");
      setVistaFormulario(false);
    } else {
      alert("❌ Error al guardar el usuario");
    }
  } else {
    const resultado = await DataService.crearUsuario(usuarioNuevo);
    if (resultado) {
      // resultado debería incluir el id generado por SQLite
      const usuariosActualizados = [...usuarios, resultado];
      onActualizar(usuariosActualizados);
      alert("✅ El usuario se ha guardado correctamente");
      setVistaFormulario(false);
    } else {
      alert("❌ Error al crear el usuario");
    }
  }
};


  const confirmarEliminar = () => {
    if (!usuarioSeleccionado) {
      alert("⚠️ Por favor, seleccione un usuario de la lista");
      return;
    }
    setMostrarPopupEliminar(true);
  };

  const handleEliminar = async () => {
    const exito = await DataService.eliminarUsuario(usuarioSeleccionado.id);
    if (exito) {
      const usuariosActualizados = usuarios.filter(
        (u) => u.id !== usuarioSeleccionado.id
      );
      onActualizar(usuariosActualizados);
      setUsuarioSeleccionado(null);
      alert("✅ Usuario eliminado correctamente");
    } else {
      alert("❌ Error al eliminar el usuario");
    }
    setMostrarPopupEliminar(false);
  };

  if (vistaFormulario) {
    return (
      <FormularioUsuario
        usuario={usuarioEditar}
        onGuardar={handleGuardar}
        onCancelar={() => setVistaFormulario(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">Gestión de Usuarios</h1>
          <button
            onClick={onVolver}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm"
          >
            Atrás
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Usuario</th>
                  <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Seleccionar
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u, index) => (
                  <tr
                    key={index}
                    className={`border-b hover:bg-gray-50 ${
                      usuarioSeleccionado?.usuario === u.usuario
                        ? "bg-gray-200"
                        : ""
                    }`}
                    onClick={() => setUsuarioSeleccionado(u)}
                  >
                    <td className="px-4 py-3">{u.usuario}</td>
                    <td className="px-4 py-3">{u.tipo}</td>
                    <td className="px-4 py-3 text-center">
                      {usuarioSeleccionado?.usuario === u.usuario ? "✔️" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex space-x-3 p-4">
            <button
              onClick={handleAgregar}
              className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              Agregar
            </button>
            <button
              onClick={handleEditar}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Editar
            </button>
            <button
              onClick={confirmarEliminar}
              className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        </div>
      </main>

      {mostrarPopupEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar borrado</h3>
            <p className="mb-6">
              ¿Desea borrar el usuario {usuarioSeleccionado?.usuario}?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleEliminar}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Eliminar
              </button>
              <button
                onClick={() => setMostrarPopupEliminar(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
//
const GestionProductos = ({ productos, onVolver, onActualizar }) => {
  const [vistaFormulario, setVistaFormulario] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [mostrarPopupEliminar, setMostrarPopupEliminar] = useState(false);
  const [productoEliminar, setProductoEliminar] = useState(null);

  const handleEditar = (producto) => {
    setProductoEditar(producto);
    setVistaFormulario(true);
  };

  const handleNuevo = () => {
    setProductoEditar(null);
    setVistaFormulario(true);
  };

  const handleGuardar = async (productoNuevo) => {
    if (productoEditar) {
      // Editar producto existente
      const productosActualizados = productos.map(p => 
        p.nombre === productoEditar.nombre ? productoNuevo : p
      );
      
      const exito = await DataService.actualizarProductos(productosActualizados);
      if (exito) {
        onActualizar(productosActualizados);
        alert('✅ El producto se ha guardado correctamente');
        setVistaFormulario(false);
      } else {
        alert('❌ Error al guardar el producto');
      }
    } else {
      // Crear nuevo producto
      const resultado = await DataService.crearProducto(productoNuevo);
      if (resultado) {
        const productosActualizados = [...productos, productoNuevo];
        onActualizar(productosActualizados);
        alert('✅ El producto se ha guardado correctamente');
        setVistaFormulario(false);
      } else {
        alert('❌ Error al crear el producto');
      }
    }
  };

  const confirmarEliminar = (producto) => {
    setProductoEliminar(producto);
    setMostrarPopupEliminar(true);
  };

  const handleEliminar = async () => {
    const exito = await DataService.eliminarProducto(productoEliminar.nombre);
    if (exito) {
      const productosActualizados = productos.filter(p => p.nombre !== productoEliminar.nombre);
      onActualizar(productosActualizados);
      alert('✅ Producto eliminado correctamente');
    } else {
      alert('❌ Error al eliminar el producto');
    }
    setMostrarPopupEliminar(false);
    setProductoEliminar(null);
  };

  if (vistaFormulario) {
    return (
      <FormularioProducto
        producto={productoEditar}
        onGuardar={handleGuardar}
        onCancelar={() => setVistaFormulario(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">Gestión de Productos</h1>
          <button
            onClick={onVolver}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm"
          >
            Atrás
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <button
              onClick={handleNuevo}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              + Agregar Producto
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold">Precio</th>
                  <th className="px-4 py-3 text-left font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold">Categoría</th>
                  <th className="px-4 py-3 text-center font-semibold">Editar</th>
                  <th className="px-4 py-3 text-center font-semibold">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{producto.nombre}</td>
                    <td className="px-4 py-3">{producto.precio.toFixed(2)}€</td>
                    <td className="px-4 py-3">{producto.stock}</td>
                    <td className="px-4 py-3 capitalize">{producto.categoria}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEditar(producto)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Editar
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => confirmarEliminar(producto)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {mostrarPopupEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar borrado</h3>
            <p className="mb-6">¿Desea borrar el producto "{productoEliminar?.nombre}"?</p>
            <div className="flex space-x-3">
              <button
                onClick={handleEliminar}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Eliminar
              </button>
              <button
                onClick={() => setMostrarPopupEliminar(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// Formulario producto
const FormularioProducto = ({ producto, onGuardar, onCancelar }) => {
  const [nombre, setNombre] = useState(producto?.nombre || '');
  const [stock, setStock] = useState(producto?.stock || '');
  const [precio, setPrecio] = useState(producto?.precio || '');
  const [categoria, setCategoria] = useState(producto?.categoria || '');
  const [error, setError] = useState('');

  const handleGuardar = () => {
    if (!nombre.trim() || !stock || !precio || !categoria.trim()) {
      setError('Los campos no pueden estar vacíos');
      return;
    }

    const productoNuevo = {
      nombre: nombre.trim(),
      stock: parseInt(stock),
      precio: parseFloat(precio),
      categoria: categoria.trim().toLowerCase(),
      fotos: producto?.fotos || []
    };

    onGuardar(productoNuevo);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {producto?.nombre ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nombre del Producto</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Stock</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Precio (€)</label>
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Seleccionar...</option>
              <option value="mujer">Mujer</option>
              <option value="hombre">Hombre</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleGuardar}
              className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800 transition"
            >
              Guardar
            </button>
            <button
              onClick={onCancelar}
              className="flex-1 border-2 border-red-500 text-red-500 py-2 rounded hover:bg-red-50 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};