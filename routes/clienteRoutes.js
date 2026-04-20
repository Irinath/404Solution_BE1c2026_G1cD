const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.get('/', clienteController.index);
router.get('/nuevo', clienteController.formCrear);
router.post('/nuevo', clienteController.almacenar);
router.get('/editar/:id', clienteController.formEditar);
router.post('/editar/:id', clienteController.actualizar);
router.post('/eliminar/:id', clienteController.eliminar);

module.exports = router;