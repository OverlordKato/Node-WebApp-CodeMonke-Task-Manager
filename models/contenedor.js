const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContenedorSchema = new Schema({  
    nombre: {
        type: String,
        required: true
    },    
    descripcion: {
        type: String,
        required: true
    },    
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'usuario'
    },
    tareas: [
        {type: mongoose.Schema.Types.ObjectId, ref: 'tarea'}
    ],
    fechaCreacion: {
        type: Date
    }
}, { versionKey: false });// Evita guardar el versionkey al crear un contenedor (el __v: 0)

// Busca todos los contenedores
ContenedorSchema.methods.findAll = async function() {
    const Contenedor = mongoose.model("contenedor", ContenedorSchema);
    return await Contenedor.find();
}

// Pasando "contenedor" a plural ya no crea la colección "contenedors" en MongoDB
module.exports = mongoose.model('contenedores', ContenedorSchema);