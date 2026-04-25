const fs = require("fs");
const path = require("path");

class Cliente {
  constructor() {
    this.archivoPath = path.join(__dirname, "../data/clientes.json");
  }

  leer() {
    try {
      const data = fs.readFileSync(this.archivoPath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  guardar(datos) {
    fs.writeFileSync(this.archivoPath, JSON.stringify(datos, null, 2));
  }

  listarTodos() {
    return this.leer();
  }

  crear(nuevo) {
    const lista = this.leer();
    const idAValidar = parseInt(nuevo.id);

    const existe = lista.find((c) => parseInt(c.id) === idAValidar);
    if (existe) {
      throw new Error(`El ID ${idAValidar} ya está en uso.`);
    }

    const clienteLimpio = {
      id: idAValidar,
      tipoDoc: nuevo.tipoDoc,
      nroDoc: nuevo.nroDoc,
      nombre: nuevo.tipoDoc === "DNI" ? nuevo.nombre : null, // para que si tipoDoc no es dni cargue un valor null
      email: nuevo.email,
      telefono: nuevo.telefono,
      direccion: nuevo.direccion,
      razonSocial: nuevo.tipoDoc === "CUIT" ? nuevo.razonSocial : null,
      saldoCuentaCorriente: parseFloat(nuevo.saldoCuentaCorriente) || 0,
    };

    lista.push(clienteLimpio);
    this.guardar(lista);
  }

  buscarPorId(id) {
    const lista = this.leer();
    return lista.find((c) => c.id == id);
  }

  actualizar(id, datos) {
    let lista = this.leer();
    const indice = lista.findIndex((c) => c.id == id);
    if (indice !== -1) {
      lista[indice] = {
        ...lista[indice],
        nombre: datos.nombre,
        tipoDoc: datos.tipoDoc,
        nroDoc: datos.nroDoc,
        email: datos.email,
        telefono: datos.telefono,
        direccion: datos.direccion,
        saldoCuentaCorriente: parseFloat(datos.saldoCuentaCorriente) || 0,
        id: parseInt(id),
      };
      this.guardar(lista);
    }
  }

  eliminar(id) {
    let lista = this.leer();
    lista = lista.filter((c) => c.id != id);
    this.guardar(lista);
  }
}

module.exports = new Cliente();
