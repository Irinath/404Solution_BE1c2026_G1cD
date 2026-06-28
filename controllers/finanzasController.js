const FacturaCliente = require("../models/FacturaCliente");
const FacturaProveedor = require("../models/FacturaProveedor");
const OrdenPago = require("../models/OrdenPago");
const Presupuesto = require("../models/Presupuesto");
const NotaDeCredito = require("../models/NotaDeCredito");
const NotaDeDebito = require("../models/NotaDeDebito");

const finanzasController = {
  // Dashboard principal con estadísticas
  resumen: async (req, res) => {
    try {
      // Estadísticas de documentos
      const facturasClientesPendientes = await FacturaCliente.countDocuments({ estatus: "Pendiente" });
      const facturasProveedoresPendientes = await FacturaProveedor.countDocuments({ estatus: "Pendiente" });
      const ordenesPagoPendientes = await OrdenPago.countDocuments({ estatus: "Pendiente" });
      const presupuestosVigentes = await Presupuesto.countDocuments({ 
        estatus: "Pendiente",
        fechaValidez: { $gte: new Date() }
      });

      // --- CÁLCULO TOTAL POR COBRAR ---
      // Facturas de clientes pendientes (lo que nos deben)
      const facturasClientesPendientesData = await FacturaCliente.find({ estatus: "Pendiente" });
      const sumaFacturasClientes = facturasClientesPendientesData.reduce((sum, f) => sum + (f.total || 0), 0);

      // Notas de crédito pendientes (descuento a favor del cliente, resta lo que nos deben)
      const notasCreditoPendientes = await NotaDeCredito.find({ estatus: "Pendiente" });
      const sumaNotasCredito = notasCreditoPendientes.reduce((sum, nc) => sum + (nc.total || 0), 0);

      // Notas de débito pendientes (cargo extra al cliente, suma lo que nos deben)
      const notasDebitoPendientes = await NotaDeDebito.find({ estatus: "Pendiente" });
      const sumaNotasDebito = notasDebitoPendientes.reduce((sum, nd) => sum + (nd.total || 0), 0);

      // Total por cobrar = facturas - notas de crédito + notas de débito
      const totalPorCobrar = sumaFacturasClientes - sumaNotasCredito + sumaNotasDebito;

      // --- CÁLCULO TOTAL POR PAGAR ---
      const facturasProveedoresPendientesData = await FacturaProveedor.find({ estatus: "Pendiente" });
      const totalPorPagar = facturasProveedoresPendientesData.reduce((sum, f) => sum + (f.total || 0), 0);

      // --- ÚLTIMOS MOVIMIENTOS (incluye facturas, notas de crédito y notas de débito) ---
      const ultimosMovimientos = [];

      // Facturas clientes (últimas 3)
      const ultFactClientes = await FacturaCliente.find()
        .populate('clienteId', 'nombre razonSocial tipoDoc')
        .sort({ createdAt: -1 })
        .limit(3);
      
      ultFactClientes.forEach(f => {
        const clienteNombre = f.clienteId 
          ? (f.clienteId.tipoDoc === 'DNI' ? f.clienteId.nombre : f.clienteId.razonSocial)
          : f.clienteInfo?.razonSocial || 'Cliente desconocido';
        
        ultimosMovimientos.push({
          tipo: 'Factura Cliente',
          numero: f.numero,
          entidad: clienteNombre,
          fecha: f.fechaEmision || f.createdAt,
          monto: f.total,
          estatus: f.estatus,
          link: `/facturas-cliente/ver/${f._id}`
        });
      });

      // Facturas proveedores (últimas 3)
      const ultFactProveedores = await FacturaProveedor.find()
        .populate('proveedorId', 'nombre razonSocial tipoDoc')
        .sort({ createdAt: -1 })
        .limit(3);
      
      ultFactProveedores.forEach(f => {
        const proveedorNombre = f.proveedorId 
          ? (f.proveedorId.tipoDoc === 'DNI' ? f.proveedorId.nombre : f.proveedorId.razonSocial)
          : f.proveedorInfo?.razonSocial || 'Proveedor desconocido';
        
        ultimosMovimientos.push({
          tipo: 'Factura Proveedor',
          numero: f.numero,
          entidad: proveedorNombre,
          fecha: f.fechaEmision || f.createdAt,
          monto: f.total,
          estatus: f.estatus,
          link: `/facturas-proveedor/ver/${f._id}`
        });
      });

      // Notas de crédito (últimas 3)
      const ultNotasCredito = await NotaDeCredito.find()
        .populate('clienteId', 'nombre razonSocial tipoDoc')
        .sort({ createdAt: -1 })
        .limit(3);
      
      ultNotasCredito.forEach(nc => {
        const clienteNombre = nc.clienteId 
          ? (nc.clienteId.tipoDoc === 'DNI' ? nc.clienteId.nombre : nc.clienteId.razonSocial)
          : nc.clienteInfo?.razonSocial || 'Cliente desconocido';
        
        ultimosMovimientos.push({
          tipo: 'Nota de Crédito',
          numero: nc.numero,
          entidad: clienteNombre,
          fecha: nc.fechaEmision || nc.createdAt,
          monto: nc.total,
          estatus: nc.estatus,
          link: `/notas-credito/ver/${nc._id}`
        });
      });

      // Notas de débito (últimas 3)
      const ultNotasDebito = await NotaDeDebito.find()
        .populate('clienteId', 'nombre razonSocial tipoDoc')
        .sort({ createdAt: -1 })
        .limit(3);
      
      ultNotasDebito.forEach(nd => {
        const clienteNombre = nd.clienteId 
          ? (nd.clienteId.tipoDoc === 'DNI' ? nd.clienteId.nombre : nd.clienteId.razonSocial)
          : nd.clienteInfo?.razonSocial || 'Cliente desconocido';
        
        ultimosMovimientos.push({
          tipo: 'Nota de Débito',
          numero: nd.numero,
          entidad: clienteNombre,
          fecha: nd.fechaEmision || nd.createdAt,
          monto: nd.total,
          estatus: nd.estatus,
          link: `/notas-debito/ver/${nd._id}`
        });
      });

      // Ordenar todos por fecha descendente y tomar los 10 más recientes
      ultimosMovimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      const balanceNeto = totalPorCobrar - totalPorPagar;

      res.render("finanzas/index", {
        titulo: "Resumen Financiero - TodoStock S.A.",
        estadisticas: {
          facturasClientesPendientes,
          facturasProveedoresPendientes,
          ordenesPagoPendientes,
          presupuestosVigentes,
          totalPorCobrar: Math.round(totalPorCobrar * 100) / 100,
          totalPorPagar: Math.round(totalPorPagar * 100) / 100,
          balanceNeto: Math.round(balanceNeto * 100) / 100,
          notasCreditoPendientes: notasCreditoPendientes.length,
          notasDebitoPendientes: notasDebitoPendientes.length
        },
        ultimosMovimientos: ultimosMovimientos.slice(0, 10)
      });
    } catch (error) {
      console.error('Error en resumen financiero:', error);
      res.render("finanzas/index", {
        titulo: "Resumen Financiero - TodoStock S.A.",
        error: "Error al generar el resumen financiero: " + error.message,
        estadisticas: {
          facturasClientesPendientes: 0,
          facturasProveedoresPendientes: 0,
          ordenesPagoPendientes: 0,
          presupuestosVigentes: 0,
          totalPorCobrar: 0,
          totalPorPagar: 0,
          balanceNeto: 0,
          notasCreditoPendientes: 0,
          notasDebitoPendientes: 0
        },
        ultimosMovimientos: []
      });
    }
  },

  // Cuentas por cobrar (facturas de clientes pendientes)
  cuentasPorCobrar: async (req, res) => {
    try {
      const { fechaDesde, fechaHasta, clienteId, tipoDoc } = req.query;
      const Cliente = require("../models/Cliente");
      
      // Traer todos los clientes para el select
      const todosLosClientes = await Cliente.find().sort({ razonSocial: 1, nombre: 1 });

      // Filtro de fechas
      let filtroFecha = {};
      if (fechaDesde || fechaHasta) {
        filtroFecha.fechaEmision = {};
        if (fechaDesde) {
          const desde = new Date(fechaDesde);
          desde.setHours(0, 0, 0, 0);
          filtroFecha.fechaEmision.$gte = desde;
        }
        if (fechaHasta) {
          const hasta = new Date(fechaHasta);
          hasta.setHours(23, 59, 59, 999);
          filtroFecha.fechaEmision.$lte = hasta;
        }
      }

      // Filtro por cliente seleccionado
      let filtroCliente = {};
      if (clienteId && clienteId !== 'todos') {
        filtroCliente.clienteId = clienteId;
      }

      // Determinar qué tipos de documentos mostrar
      const mostrarFacturas = !tipoDoc || tipoDoc === 'todos' || tipoDoc === 'factura';
      const mostrarNC = !tipoDoc || tipoDoc === 'todos' || tipoDoc === 'credito';
      const mostrarND = !tipoDoc || tipoDoc === 'todos' || tipoDoc === 'debito';

      // Facturas pendientes
      let facturas = [];
      if (mostrarFacturas) {
        const filtroFacturas = { estatus: "Pendiente", ...filtroFecha, ...filtroCliente };
        facturas = await FacturaCliente.find(filtroFacturas)
          .populate('clienteId', 'nombre razonSocial tipoDoc nroDoc')
          .sort({ fechaVencimiento: 1 });
      }

      // Notas de crédito pendientes
      let notasCredito = [];
      if (mostrarNC) {
        const filtroNC = { estatus: "Pendiente", ...filtroFecha, ...filtroCliente };
        notasCredito = await NotaDeCredito.find(filtroNC)
          .populate('clienteId', 'nombre razonSocial tipoDoc nroDoc');
      }

      // Notas de débito pendientes
      let notasDebito = [];
      if (mostrarND) {
        const filtroND = { estatus: "Pendiente", ...filtroFecha, ...filtroCliente };
        notasDebito = await NotaDeDebito.find(filtroND)
          .populate('clienteId', 'nombre razonSocial tipoDoc nroDoc');
      }

      // Agrupar por cliente
      const clientesMap = {};

      facturas.forEach(f => {
        const clienteKey = f.clienteId ? f.clienteId._id.toString() : 'desconocido';
        if (!clientesMap[clienteKey]) {
          const nombre = f.clienteId 
            ? (f.clienteId.tipoDoc === 'DNI' ? f.clienteId.nombre : f.clienteId.razonSocial)
            : f.clienteInfo?.razonSocial || 'Cliente desconocido';
          const doc = f.clienteId ? f.clienteId.nroDoc : f.clienteInfo?.cuit || 'N/A';
          clientesMap[clienteKey] = {
            nombre,
            documento: doc,
            facturas: [],
            notasCredito: [],
            notasDebito: [],
            totalFacturas: 0,
            totalNC: 0,
            totalND: 0,
            saldoNeto: 0
          };
        }
        clientesMap[clienteKey].facturas.push(f);
        clientesMap[clienteKey].totalFacturas += (f.total || 0);
      });

      notasCredito.forEach(nc => {
        const clienteKey = nc.clienteId ? nc.clienteId._id.toString() : 'desconocido';
        if (!clientesMap[clienteKey]) {
          const nombre = nc.clienteId 
            ? (nc.clienteId.tipoDoc === 'DNI' ? nc.clienteId.nombre : nc.clienteId.razonSocial)
            : nc.clienteInfo?.razonSocial || 'Cliente desconocido';
          const doc = nc.clienteId ? nc.clienteId.nroDoc : nc.clienteInfo?.cuit || 'N/A';
          clientesMap[clienteKey] = {
            nombre,
            documento: doc,
            facturas: [],
            notasCredito: [],
            notasDebito: [],
            totalFacturas: 0,
            totalNC: 0,
            totalND: 0,
            saldoNeto: 0
          };
        }
        clientesMap[clienteKey].notasCredito.push(nc);
        clientesMap[clienteKey].totalNC += (nc.total || 0);
      });

      notasDebito.forEach(nd => {
        const clienteKey = nd.clienteId ? nd.clienteId._id.toString() : 'desconocido';
        if (!clientesMap[clienteKey]) {
          const nombre = nd.clienteId 
            ? (nd.clienteId.tipoDoc === 'DNI' ? nd.clienteId.nombre : nd.clienteId.razonSocial)
            : nd.clienteInfo?.razonSocial || 'Cliente desconocido';
          const doc = nd.clienteId ? nd.clienteId.nroDoc : nd.clienteInfo?.cuit || 'N/A';
          clientesMap[clienteKey] = {
            nombre,
            documento: doc,
            facturas: [],
            notasCredito: [],
            notasDebito: [],
            totalFacturas: 0,
            totalNC: 0,
            totalND: 0,
            saldoNeto: 0
          };
        }
        clientesMap[clienteKey].notasDebito.push(nd);
        clientesMap[clienteKey].totalND += (nd.total || 0);
      });

      // Calcular saldo neto por cliente
      Object.values(clientesMap).forEach(cliente => {
        cliente.saldoNeto = Math.round((cliente.totalFacturas - cliente.totalNC + cliente.totalND) * 100) / 100;
        cliente.totalFacturas = Math.round(cliente.totalFacturas * 100) / 100;
        cliente.totalNC = Math.round(cliente.totalNC * 100) / 100;
        cliente.totalND = Math.round(cliente.totalND * 100) / 100;
      });

      // Convertir a array y ordenar por saldo descendente
      const clientes = Object.values(clientesMap).sort((a, b) => b.saldoNeto - a.saldoNeto);

      // Totales generales
      const sumaFacturas = clientes.reduce((sum, c) => sum + c.totalFacturas, 0);
      const totalNotasCredito = clientes.reduce((sum, c) => sum + c.totalNC, 0);
      const totalNotasDebito = clientes.reduce((sum, c) => sum + c.totalND, 0);
      const total = sumaFacturas - totalNotasCredito + totalNotasDebito;

      res.render("finanzas/cuentas-cobrar", {
        titulo: "Cuentas por Cobrar - TodoStock S.A.",
        clientes,
        todosLosClientes,
        total: Math.round(total * 100) / 100,
        sumaFacturas: Math.round(sumaFacturas * 100) / 100,
        totalNotasCredito: Math.round(totalNotasCredito * 100) / 100,
        totalNotasDebito: Math.round(totalNotasDebito * 100) / 100,
        filtros: { fechaDesde, fechaHasta, clienteId, tipoDoc }
      });
    } catch (error) {
      console.error('Error en cuentas por cobrar:', error);
      res.render("finanzas/cuentas-cobrar", {
        titulo: "Cuentas por Cobrar - TodoStock S.A.",
        error: "Error al cargar cuentas por cobrar: " + error.message,
        clientes: [],
        todosLosClientes: [],
        total: 0,
        sumaFacturas: 0,
        totalNotasCredito: 0,
        totalNotasDebito: 0,
        filtros: {}
      });
    }
  },

  // Cuentas por pagar (facturas de proveedores pendientes)
  cuentasPorPagar: async (req, res) => {
    try {
      const { fechaDesde, fechaHasta, proveedorId, tipoDoc } = req.query;
      const Proveedor = require("../models/Proveedor");

      // Traer todos los proveedores para el select
      const todosLosProveedores = await Proveedor.find().sort({ razonSocial: 1, nombre: 1 });

      // Mostrar únicamente facturas pendientes
      let filtro = {
        estatus: "Pendiente"
      };

      if (fechaDesde || fechaHasta) {
        filtro.fechaEmision = {};
        if (fechaDesde) {
          const desde = new Date(fechaDesde);
          desde.setHours(0, 0, 0, 0);
          filtro.fechaEmision.$gte = desde;
        }
        if (fechaHasta) {
          const hasta = new Date(fechaHasta);
          hasta.setHours(23, 59, 59, 999);
          filtro.fechaEmision.$lte = hasta;
        }
      }

      // Filtro por proveedor seleccionado
      if (proveedorId && proveedorId !== 'todos') {
        filtro.proveedorId = proveedorId;
      }

      // Determinar qué tipos de documentos mostrar
      const mostrarFacturas = !tipoDoc || tipoDoc === 'todos' || tipoDoc === 'factura';
      const mostrarOrdenes = !tipoDoc || tipoDoc === 'todos' || tipoDoc === 'orden';

      let facturas = [];
      if (mostrarFacturas) {
        facturas = await FacturaProveedor.find(filtro)
          .populate('proveedorId', 'nombre razonSocial tipoDoc nroDoc')
          .sort({ fechaVencimiento: 1 });
      }

      // Órdenes de pago pendientes
      let ordenes = [];
      if (mostrarOrdenes) {
        let filtroOrden = { estatus: "Pendiente" };
        if (proveedorId && proveedorId !== 'todos') filtroOrden.proveedorId = proveedorId;
        if (fechaDesde || fechaHasta) {
          filtroOrden.fechaEmision = {};
          if (fechaDesde) {
            const desde = new Date(fechaDesde);
            desde.setHours(0, 0, 0, 0);
            filtroOrden.fechaEmision.$gte = desde;
          }
          if (fechaHasta) {
            const hasta = new Date(fechaHasta);
            hasta.setHours(23, 59, 59, 999);
            filtroOrden.fechaEmision.$lte = hasta;
          }
        }
        ordenes = await OrdenPago.find(filtroOrden)
          .populate('proveedorId', 'nombre razonSocial tipoDoc nroDoc')
          .sort({ fechaEmision: -1 });
      }

      const totalFacturas = facturas.reduce((sum, f) => sum + (f.total || 0), 0);
      const totalOrdenes = ordenes.reduce((sum, o) => sum + (o.montoAPagar || 0), 0);
      const total = totalFacturas;

      res.render("finanzas/cuentas-pagar", {
        titulo: "Cuentas por Pagar - TodoStock S.A.",
        facturas,
        ordenes,
        todosLosProveedores,
        total: Math.round(total * 100) / 100,
        totalOrdenes: Math.round(totalOrdenes * 100) / 100,
        filtros: { fechaDesde, fechaHasta, proveedorId, tipoDoc }
      });
    } catch (error) {
      console.error('Error en cuentas por pagar:', error);
      res.render("finanzas/cuentas-pagar", {
        titulo: "Cuentas por Pagar - TodoStock S.A.",
        error: "Error al cargar cuentas por pagar: " + error.message,
        facturas: [],
        ordenes: [],
        todosLosProveedores: [],
        total: 0,
        totalOrdenes: 0,
        filtros: {}
      });
    }
  }
};

module.exports = finanzasController;
