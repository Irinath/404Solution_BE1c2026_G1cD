const modeloCliente = require("../models/Cliente");
const modeloProveedor = require("../models/Proveedor");

const finanzasController = {
  resumen: (req, res) => {
    let totalCobrar = 0; // suma de saldos positivos (nos deben)
    let totalPagar = 0; // suma de saldos negativos (debemos)

    const listaFinanzas = [];

    // procesar clientes
    const clientes = modeloCliente.listarTodos();
    clientes.forEach((c) => {
      const saldo = parseFloat(c.saldoCuentaCorriente) || 0;

      if (saldo > 0) totalCobrar += saldo;
      if (saldo < 0) totalPagar += Math.abs(saldo);

      listaFinanzas.push({
        entidad: "Cliente",
        id: c.id,
        nombre: c.tipoDoc === "DNI" ? c.nombre : c.razonSocial,
        tipo: c.tipoDoc,
        saldo: saldo,
      });
    });

    // procesar proveedores
    const proveedores = modeloProveedor.listarTodos();
    proveedores.forEach((p) => {
      const saldo = parseFloat(p.saldoCuentaCorriente) || 0;

      if (saldo > 0) totalCobrar += saldo;
      if (saldo < 0) totalPagar += Math.abs(saldo);

      listaFinanzas.push({
        entidad: "Proveedor",
        id: p.id,
        nombre: p.tipoDoc === "DNI" ? p.nombre : p.razonSocial,
        tipo: p.tipoDoc,
        saldo: saldo,
      });
    });

    // balance Neto
    const balanceNeto = totalCobrar - totalPagar;

    // renderizar
    res.render("finanzas/index", {
      titulo: "Resumen Financiero - TodoStock S.A.",
      registros: listaFinanzas,
      totalCobrar: totalCobrar,
      totalPagar: totalPagar,
      balanceNeto: balanceNeto,
    });
  },
};

module.exports = finanzasController;
