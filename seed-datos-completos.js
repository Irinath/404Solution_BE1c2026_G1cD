/**
 * Script para crear datos de prueba completos
 * Crea: 2 clientes, 2 proveedores, facturas, notas de crédito/débito, facturas proveedor
 * 
 * Ejecutar: node seed-datos-completos.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Cliente = require('./models/Cliente');
const Proveedor = require('./models/Proveedor');
const FacturaCliente = require('./models/FacturaCliente');
const FacturaProveedor = require('./models/FacturaProveedor');
const NotaDeCredito = require('./models/NotaDeCredito');
const NotaDeDebito = require('./models/NotaDeDebito');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // ===================== CLIENTES =====================
    const cliente1 = await Cliente.create({
      tipoDoc: 'CUIT',
      nroDoc: '30-70987654-2',
      razonSocial: 'Tecnología Moderna S.A.',
      email: 'admin@tecmoderna.com.ar',
      telefono: '+54 11 4321 5678',
      direccion: 'Av. Corrientes 2500, CABA',
      saldoCuentaCorriente: 0
    });
    console.log('👤 Cliente 1:', cliente1.razonSocial);

    const cliente2 = await Cliente.create({
      tipoDoc: 'DNI',
      nroDoc: '28456789',
      nombre: 'Carlos Méndez',
      email: 'carlos.mendez@gmail.com',
      telefono: '+54 11 5555 1234',
      direccion: 'Belgrano 450, Avellaneda',
      saldoCuentaCorriente: 0
    });
    console.log('👤 Cliente 2:', cliente2.nombre);

    // ===================== PROVEEDORES =====================
    const proveedor1 = await Proveedor.create({
      tipoDoc: 'CUIT',
      nroDoc: '30-65432198-7',
      razonSocial: 'Insumos del Sur S.R.L.',
      email: 'ventas@insumosdelsur.com.ar',
      telefono: '+54 11 4888 9900',
      direccion: 'Ruta 2 Km 45, Quilmes',
      saldoCuentaCorriente: 0
    });
    console.log('🏭 Proveedor 1:', proveedor1.razonSocial);

    const proveedor2 = await Proveedor.create({
      tipoDoc: 'CUIT',
      nroDoc: '30-71122334-5',
      razonSocial: 'Logística Express S.A.',
      email: 'contacto@logisticaexpress.com.ar',
      telefono: '+54 11 4777 3344',
      direccion: 'Av. Mitre 3200, Lanús',
      saldoCuentaCorriente: 0
    });
    console.log('🏭 Proveedor 2:', proveedor2.razonSocial);

    // ===================== FACTURAS CLIENTES =====================
    // Factura 1 - Cliente 1 ($80.000 neto)
    const factCli1 = new FacturaCliente({
      numero: '0001-00000201',
      puntoVenta: 1,
      clienteId: cliente1._id,
      clienteInfo: { cuit: cliente1.nroDoc, razonSocial: cliente1.razonSocial },
      fechaEmision: new Date(),
      fechaVencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      estatus: 'Pendiente',
      detalles: [
        { codigo: 'SRV-010', descripcion: 'Desarrollo web - Etapa 1', cantidad: 1, precioUnitario: 50000, alicIva: '21%', importe: 50000 },
        { codigo: 'SRV-011', descripcion: 'Diseño UX/UI', cantidad: 1, precioUnitario: 30000, alicIva: '21%', importe: 30000 }
      ],
      otrosTributos: 0
    });
    await factCli1.save();
    console.log('\n🧾 Factura Cliente 1:', factCli1.numero, '- $' + factCli1.total.toFixed(2));

    // Factura 2 - Cliente 2 ($25.000 neto)
    const factCli2 = new FacturaCliente({
      numero: '0001-00000202',
      puntoVenta: 1,
      clienteId: cliente2._id,
      clienteInfo: { cuit: cliente2.nroDoc, razonSocial: cliente2.nombre },
      fechaEmision: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      fechaVencimiento: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      estatus: 'Pendiente',
      detalles: [
        { codigo: 'PROD-020', descripcion: 'Licencia software anual', cantidad: 1, precioUnitario: 25000, alicIva: '21%', importe: 25000 }
      ],
      otrosTributos: 0
    });
    await factCli2.save();
    console.log('🧾 Factura Cliente 2:', factCli2.numero, '- $' + factCli2.total.toFixed(2));

    // ===================== NOTAS DE CRÉDITO =====================
    // NC para Cliente 1 ($15.000 neto - descuento)
    const nc1 = new NotaDeCredito({
      numero: '0001-00000060',
      puntoVenta: 1,
      clienteId: cliente1._id,
      clienteInfo: { cuit: cliente1.nroDoc, razonSocial: cliente1.razonSocial },
      fechaEmision: new Date(),
      estatus: 'Pendiente',
      conceptos: [
        { codigo: 'DESC-010', descripcion: 'Descuento comercial por volumen', cantidad: 1, precioUnitario: 15000, alicIva: '21%', importe: 15000 }
      ],
      otrosTributos: 0,
      facturaOrigenId: factCli1._id,
      facturaOrigenNumero: factCli1.numero
    });
    await nc1.save();
    console.log('➖ Nota de Crédito 1:', nc1.numero, '- $' + nc1.total.toFixed(2));

    // NC para Cliente 2 ($5.000 neto)
    const nc2 = new NotaDeCredito({
      numero: '0001-00000061',
      puntoVenta: 1,
      clienteId: cliente2._id,
      clienteInfo: { cuit: cliente2.nroDoc, razonSocial: cliente2.nombre },
      fechaEmision: new Date(),
      estatus: 'Pendiente',
      conceptos: [
        { codigo: 'DESC-011', descripcion: 'Bonificación por fidelidad', cantidad: 1, precioUnitario: 5000, alicIva: '21%', importe: 5000 }
      ],
      otrosTributos: 0,
      facturaOrigenId: factCli2._id,
      facturaOrigenNumero: factCli2.numero
    });
    await nc2.save();
    console.log('➖ Nota de Crédito 2:', nc2.numero, '- $' + nc2.total.toFixed(2));

    // ===================== NOTAS DE DÉBITO =====================
    // ND para Cliente 1 ($3.000 neto - intereses)
    const nd1 = new NotaDeDebito({
      numero: '0001-00000030',
      puntoVenta: 1,
      clienteId: cliente1._id,
      clienteInfo: { cuit: cliente1.nroDoc, razonSocial: cliente1.razonSocial },
      fechaEmision: new Date(),
      estatus: 'Pendiente',
      concepto: {
        descripcion: 'Intereses por mora - 30 días',
        precioUnitario: 3000,
        alicIva: '21%',
        importe: 3000
      },
      otrosTributos: 0,
      facturaOrigenId: factCli1._id,
      facturaOrigenNumero: factCli1.numero
    });
    await nd1.save();
    console.log('➕ Nota de Débito 1:', nd1.numero, '- $' + nd1.total.toFixed(2));

    // ND para Cliente 2 ($2.000 neto - gastos administrativos)
    const nd2 = new NotaDeDebito({
      numero: '0001-00000031',
      puntoVenta: 1,
      clienteId: cliente2._id,
      clienteInfo: { cuit: cliente2.nroDoc, razonSocial: cliente2.nombre },
      fechaEmision: new Date(),
      estatus: 'Pendiente',
      concepto: {
        descripcion: 'Gastos administrativos por gestión de cobranza',
        precioUnitario: 2000,
        alicIva: '21%',
        importe: 2000
      },
      otrosTributos: 0,
      facturaOrigenId: factCli2._id,
      facturaOrigenNumero: factCli2.numero
    });
    await nd2.save();
    console.log('➕ Nota de Débito 2:', nd2.numero, '- $' + nd2.total.toFixed(2));

    // ===================== FACTURAS PROVEEDORES =====================
    // Factura Proveedor 1 ($45.000 neto)
    const factProv1 = new FacturaProveedor({
      numero: '0003-00000150',
      puntoVenta: 3,
      proveedorId: proveedor1._id,
      proveedorInfo: { cuit: proveedor1.nroDoc, razonSocial: proveedor1.razonSocial },
      fechaEmision: new Date(),
      fechaVencimiento: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      estatus: 'Pendiente',
      detalles: [
        { codigo: 'INS-001', descripcion: 'Papel A4 resma x 10', cantidad: 5, precioUnitario: 5000, alicIva: '21%', importe: 25000 },
        { codigo: 'INS-002', descripcion: 'Toner impresora HP', cantidad: 4, precioUnitario: 5000, alicIva: '21%', importe: 20000 }
      ],
      otrosTributos: 0
    });
    await factProv1.save();
    console.log('\n📑 Factura Proveedor 1:', factProv1.numero, '- $' + factProv1.total.toFixed(2));

    // Factura Proveedor 2 ($18.000 neto)
    const factProv2 = new FacturaProveedor({
      numero: '0002-00000088',
      puntoVenta: 2,
      proveedorId: proveedor2._id,
      proveedorInfo: { cuit: proveedor2.nroDoc, razonSocial: proveedor2.razonSocial },
      fechaEmision: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      fechaVencimiento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      estatus: 'Pendiente',
      detalles: [
        { codigo: 'LOG-001', descripcion: 'Servicio de flete mensual', cantidad: 1, precioUnitario: 18000, alicIva: '21%', importe: 18000 }
      ],
      otrosTributos: 0
    });
    await factProv2.save();
    console.log('📑 Factura Proveedor 2:', factProv2.numero, '- $' + factProv2.total.toFixed(2));

    // ===================== RESUMEN =====================
    console.log('\n════════════════════════════════════════');
    console.log('         RESUMEN DE DATOS CREADOS');
    console.log('════════════════════════════════════════');
    console.log('\n📊 CUENTAS POR COBRAR:');
    console.log('  Facturas Clientes:');
    console.log('    ' + factCli1.numero + ' (' + cliente1.razonSocial + '): $' + factCli1.total.toFixed(2));
    console.log('    ' + factCli2.numero + ' (' + cliente2.nombre + '): $' + factCli2.total.toFixed(2));
    const totalFact = factCli1.total + factCli2.total;
    console.log('    Subtotal facturas: $' + totalFact.toFixed(2));
    
    console.log('  Notas de Crédito (restan):');
    console.log('    ' + nc1.numero + ': -$' + nc1.total.toFixed(2));
    console.log('    ' + nc2.numero + ': -$' + nc2.total.toFixed(2));
    const totalNC = nc1.total + nc2.total;
    console.log('    Subtotal NC: -$' + totalNC.toFixed(2));
    
    console.log('  Notas de Débito (suman):');
    console.log('    ' + nd1.numero + ': +$' + nd1.total.toFixed(2));
    console.log('    ' + nd2.numero + ': +$' + nd2.total.toFixed(2));
    const totalND = nd1.total + nd2.total;
    console.log('    Subtotal ND: +$' + totalND.toFixed(2));
    
    const totalCobrar = totalFact - totalNC + totalND;
    console.log('\n  ➡️  TOTAL POR COBRAR: $' + totalCobrar.toFixed(2));

    console.log('\n📊 CUENTAS POR PAGAR:');
    console.log('    ' + factProv1.numero + ' (' + proveedor1.razonSocial + '): $' + factProv1.total.toFixed(2));
    console.log('    ' + factProv2.numero + ' (' + proveedor2.razonSocial + '): $' + factProv2.total.toFixed(2));
    const totalPagar = factProv1.total + factProv2.total;
    console.log('\n  ➡️  TOTAL POR PAGAR: $' + totalPagar.toFixed(2));

    console.log('\n📊 BALANCE NETO: $' + (totalCobrar - totalPagar).toFixed(2));
    console.log('════════════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('✅ Seed completado. Desconectado de MongoDB.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
