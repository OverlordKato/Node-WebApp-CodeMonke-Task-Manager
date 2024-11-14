const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Añadimos la libreria bcrypt para hacer hash a las contraseñas.
//Se recomienda un hasheo de 10 pasadas como mínimo

const bcrypt = require('bcrypt');

const UsuarioSchema = new Schema({
    aliasUsuario: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },   
    password: {
        type: String,
        required: true
    },    
    nombre: {
        type: String,
        required: true
    },    
    apellido1: {
        type: String,
        required: true
    },    
    apellido2: {
        type: String
    },   
    contenedores: [
        {type: mongoose.Schema.Types.ObjectId, ref: 'contenedor'}
    ]
}, { versionKey: false });// Evita guardar el versionkey al crear un contenedor (el __v: 0)

//Métodos de Bcrypt para hasehar contraseñas y comparar los hashes de la base de datos

/*
    Método Hashsync de Bcrypt, funciona de la siguiente manera
        1. Coge como parametros un string (la contraseña) y el método de encriptación
        2. En este caso se genera un string hasheado con una parte fija (el Salt)
        3. Se especifica el número de veces que se va a rehashear, es decir, se hashea sobre si mismo (en este caso 13, dado que tarda unos 500 ms por cada contraseña)
*/
UsuarioSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(13));
};

// Método compareSync, que compara la contraseña dehasheada con la contraseña original.
UsuarioSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

// FindAll, para listar todos los usuarios
UsuarioSchema.methods.findAll = async function() {
    const Usuario = mongoose.model("usuario", UsuarioSchema);
    return await Usuario.find();
}

// FindById, encontrar un solo usuario por correo electrónico, no por nombre de usuario
UsuarioSchema.methods.findById = async function (id) {
    const Usuario = mongoose.model("usuario", UsuarioSchema);
    return await Usuario.findById(id);
}

// Insert, inserta un nuevo usuario en la BD
UsuarioSchema.methods.insert = async function() {
    await this.save((err, res) => {
        if(err){
            console.log(err);
        }
        else{
            console.log("Usuario añadido correctamente : " + res);
        }
    });
}

//Update, para actualizar un solo usuario (en la pantalla de modificación de perfil)
UsuarioSchema.methods.update = async (id, user) => {
    const Usuario = mongoose.model("usuario", UsuarioSchema);
    await Usuario.updateOne({ _id: id }, user, err => {
      if (err) console.log(err);
    });
    console.log(id + " updated");
  };

//Delete, para borrar el Usuario por completo (hay que revisar esta opción)
UsuarioSchema.methods.delete = async function (id) {
    const User = mongoose.model("usuario", UsuarioSchema);
    await User.deleteOne({ _id: id }, err => {
      if (err) console.log(err);
    });
    console.log(id + " borrado con éxito de la aplicación");
  
  };

module.exports = mongoose.model('usuario', UsuarioSchema);