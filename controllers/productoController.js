const modeloProducto = require('../models/Producto');

const productoController = {
    // 1. Renderiza la lista completa en la home
    index: (req, res) => {
        const productos = modeloProducto.listarTodos();
        res.render('productos/index', {
            titulo: 'Inventario TodoStock S.A.',
            productos: productos
        });
    },

    // 2. Muestra el formulario de carga vacío
    formCrear: (req, res) => {
        res.render('productos/crear', {
            titulo: 'Registrar Nuevo Producto',
            error: null,
            datos: null
        });
    },

    // 3. Procesa los datos del formulario (POST)
    almacenar: (req, res) => {
        try {
            // Pasamos todo el req.body que ahora contiene el ID manual
            modeloProducto.crear(req.body);

            // Si todo sale bien, redirige a la lista
            res.redirect('/');
        } catch (error) {
            // Guardamos los datos enviados para devolverlos a la vista
            const datosCargados = req.body;

            // Renderizamos el formulario de nuevo
            res.render('productos/crear', {
                titulo: 'Registrar Nuevo Producto',
                error: error.message,
                // Mandamos los datos excepto el ID
                datos: {
                    nombre: datosCargados.nombre,
                    categoria: datosCargados.categoria,
                    precio: datosCargados.precio,
                    stockActual: datosCargados.stockActual,
                    stockMinimo: datosCargados.stockMinimo
                }
            });
        }
    },
    // Muestra el formulario de edición con los datos cargados
    formEditar: (req, res) => {
        const producto = modeloProducto.buscarPorId(req.params.id);
        res.render('productos/editar', { titulo: 'Editar Producto', producto });
    },

    // Procesa la actualización
    actualizar: (req, res) => {
        modeloProducto.actualizar(req.params.id, req.body);
        res.redirect('/');
    },

    // Procesa la eliminación
    eliminar: (req, res) => {
        modeloProducto.eliminar(req.params.id);
        res.redirect('/');
    }
};

module.exports = productoController;