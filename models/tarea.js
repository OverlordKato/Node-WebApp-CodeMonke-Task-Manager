const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TareaSchema = new Schema({   
    nombre: {
        type: String,
        required: true
    },    
    descripcion: {
        type: String,
        required: true
    },    
    etiquetas: [
        {type: String}
    ],
    estado: {
        type: String,
        required: true
    },
    fechaCreacion: {
        type: Date
    },
    contenedor_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'contenedor'
    }
}, { versionKey: false });// Evita guardar el versionkey al crear un contenedor (el __v: 0)

// Busca todas las tareas
TareaSchema.methods.findAll = async function() {
    const Tarea = mongoose.model("tarea", TareaSchema);
    return await Tarea.find();
}

// Pasado "tarea" a plural para evitar posibles problemas en MongoDB
module.exports = mongoose.model('tareas', TareaSchema);