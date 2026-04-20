const express = require('express');
const app = express();
const path = require('path');
const rutasProductos = require('./routes/productoRoutes');

// Configuración de Pug y estaticos(Clase 4)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares (Clase 2 y 4)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // Para leer formularios
app.use(express.json()); // Para Thunder Client

// Uso de las rutas
app.use('/', rutasProductos);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});