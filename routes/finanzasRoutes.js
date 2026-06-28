const express = require("express");
const router = express.Router();
const finanzasController = require("../controllers/finanzasController");

// Dashboard principal
router.get("/", finanzasController.resumen);

// Cuentas por cobrar
router.get("/cuentas-cobrar", finanzasController.cuentasPorCobrar);

// Cuentas por pagar
router.get("/cuentas-pagar", finanzasController.cuentasPorPagar);

// Cobrar facturas de clientes (emitir recibo de cobro)
router.get("/cobrar", finanzasController.formCobrar);
router.post("/cobrar", finanzasController.procesarCobro);

// Pagar facturas de proveedores (emitir orden de pago)
router.get("/pagar", finanzasController.formPagar);
router.post("/pagar", finanzasController.procesarPago);

module.exports = router;
