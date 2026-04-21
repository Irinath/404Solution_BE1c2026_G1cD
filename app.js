const express = require('express');
const app = express();
const path = require('path');
const rutasProductos = require('./routes/productoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');

// Configuración de Pug y estaticos
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middlewares 
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // Para leer formularios
app.use(express.json()); // Para Thunder Client

// Uso de las rutas
app.use('/', rutasProductos);
app.use('/clientes', clienteRoutes);
app.use('/proveedores', proveedorRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});