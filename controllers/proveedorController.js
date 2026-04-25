const modeloProveedor = require('../models/Proveedor');

const proveedorController = {
    index: (req, res) => {
        const proveedores = modeloProveedor.listarTodos();
        res.render('proveedores/index', {
            titulo: 'Proveedores - TodoStock S.A.',
            proveedores
        });
    },

    formCrear: (req, res) => {
        res.render('proveedores/crear', {
            titulo: 'Registrar Nuevo Proveedor',
            error: null,
            datos: null
        });
    },

    almacenar: (req, res) => {
        try {
            modeloProveedor.crear(req.body);
            res.redirect('/proveedores');
        } catch (error) {
            const datosCargados = req.body;
            res.render('proveedores/crear', {
                titulo: 'Registrar Nuevo Proveedor',
                error: error.message,
                datos: {
                    nombre: datosCargados.razon_social,
                    email: datosCargados.email,
                    telefono: datosCargados.telefono,
                    direccion: datosCargados.direccion
                }
            });
        }
    },

    formEditar: (req, res) => {
        const proveedor = modeloProveedor.buscarPorId(req.params.id);
        res.render('proveedores/editar', { titulo: 'Editar Proveedor', proveedor });
    },

    actualizar: (req, res) => {
        modeloProveedor.actualizar(req.params.id, req.body);
        res.redirect('/proveedores');
    },

    eliminar: (req, res) => {
        modeloProveedor.eliminar(req.params.id);
        res.redirect('/proveedores');
    }
};

module.exports = proveedorController;