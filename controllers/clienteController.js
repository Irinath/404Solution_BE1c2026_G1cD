const modeloCliente = require('../models/Cliente');

const clienteController = {
    index: (req, res) => {
        const clientes = modeloCliente.listarTodos();
        res.render('clientes/index', {
            titulo: 'Clientes - TodoStock S.A.',
            clientes
        });
    },

    formCrear: (req, res) => {
        res.render('clientes/crear', {
            titulo: 'Registrar Nuevo Cliente',
            error: null,
            datos: null
        });
    },

    almacenar: (req, res) => {
        try {
            modeloCliente.crear(req.body);
            res.redirect('/clientes');
        } catch (error) {
            const datosCargados = req.body;
            res.render('clientes/crear', {
                titulo: 'Registrar Nuevo Cliente',
                error: error.message,
                datos: {
                    nombre: datosCargados.nombre,
                    email: datosCargados.email,
                    telefono: datosCargados.telefono,
                    direccion: datosCargados.direccion
                }
            });
        }
    },

    formEditar: (req, res) => {
        const cliente = modeloCliente.buscarPorId(req.params.id);
        res.render('clientes/editar', { titulo: 'Editar Cliente', cliente });
    },

    actualizar: (req, res) => {
        modeloCliente.actualizar(req.params.id, req.body);
        res.redirect('/clientes');
    },

    eliminar: (req, res) => {
        modeloCliente.eliminar(req.params.id);
        res.redirect('/clientes');
    }
};

module.exports = clienteController;