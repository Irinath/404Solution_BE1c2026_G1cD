const fs = require('fs');
const path = require('path');

class Producto {
    constructor() {
        // Ruta al archivo JSON
        this.archivoPath = path.join(__dirname, '../data/productos.json');
    }

    // Método privado para leer el archivo
    leer() {
        try {
            const data = fs.readFileSync(this.archivoPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return []; // Si el archivo no existe o está vacío, devuelve un array
        }
    }

    // Método para guardar los datos
    guardar(datos) {
        fs.writeFileSync(this.archivoPath, JSON.stringify(datos, null, 2));
    }

    // Obtener todos los productos (para la vista principal)
    listarTodos() {
        return this.leer();
    }

    // Crear un nuevo producto (para el formulario)
    crear(nuevo) {
        const lista = this.leer();
        const idAValidar = parseInt(nuevo.id);
        // HASTA NO IMPLEMENTAR LA BASE DE DATOS, USAMOS ESTE MÉTODO PARA VALIDAR QUE NO SE REPITAN LOS ID EN EL JSON

        // Buscamos si ya existe (Validación de no repetición)
        const existe = lista.find(p => parseInt(p.id) === idAValidar);

        if (existe) {
            // Si existe, lanzamos un error que el controlador atrapará
            throw new Error(`El ID ${idAValidar} ya está en uso.`);
        }

        const productoLimpio = {
            id: idAValidar,
            nombre: nuevo.nombre,
            categoria: nuevo.categoria,
            precio: parseFloat(nuevo.precio),
            stockActual: parseInt(nuevo.stockActual),
            stockMinimo: parseInt(nuevo.stockMinimo)
        };

        lista.push(productoLimpio);
        this.guardar(lista);
    }

    // Buscar un producto por ID
    buscarPorId(id) {
        const lista = this.leer();
        return lista.find(p => p.id == id);
    }

    // UPDATE: Actualizar datos
    actualizar(id, datos) {
        let lista = this.leer();
        const indice = lista.findIndex(p => p.id == id);
        if (indice !== -1) {
            lista[indice] = {
                ...lista[indice],
                nombre: datos.nombre,
                categoria: datos.categoria || lista[indice].categoria,
                precio: parseFloat(datos.precio),
                stockActual: parseInt(datos.stockActual),
                stockMinimo: parseInt(datos.stockMinimo),
                id: parseInt(id)
            };
            this.guardar(lista);
        }
    }

    // DELETE: Eliminar producto
    eliminar(id) {
        let lista = this.leer();
        lista = lista.filter(p => p.id != id);
        this.guardar(lista);
    }

}

module.exports = new Producto(); // Exportamos una instancia lista para usar