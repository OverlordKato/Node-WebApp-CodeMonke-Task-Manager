var express = require('express');
var router = express.Router();
const Usuario = require('../models/usuario');
const Contenedor = require('../models/contenedor');
const Tarea = require('../models/tarea');

// Es IMPERATIVO que esta ruta vaya antes que cualquier otra con :id como parámetro, si no Express interpreta "nuevo" como un ObjectID
// Pantalla de creación de contenedor
router.get('/contenedores/nuevo', async (req, res, next) => {// Cambiado de "contenedor" a "contenedores" para evitar errores a largo plazo
    try{
        if(req.isAuthenticated()){
            req.session.clang = req.query.clang;// Guarda la preferencia de idioma en la sesión, evita que clang salga undefined
            res.render('pantallaContenedorCreate');
        }
        else{
            req.flash('route', 'Acceso no permitido/ruta incorrecta');
            res.redirect('/');
        }
    }catch(error){
        console.log(error);
        res.redirect('/');
    }
});

// Ruta de creación de contenedor
router.post('/contenedor/create', async (req, res, next) => {
    try{
        if(req.isAuthenticated()){// Controla que el contenedor pertenece al usuario loggeado, no permite el acceso si no es el caso
            req.session.clang = req.query.clang;// Guarda la preferencia de idioma en la sesión, evita que clang salga undefined
            const clang = req.session.lang;// Asigna la preferencia de idioma de la sesión a clang, para luego construir la ruta

            var usuarioContenedor = await Usuario.findOne({_id: req.user.id});
            console.log(usuarioContenedor.contenedores);
            for(var cont of usuarioContenedor.contenedores){// Impedimos la creación de un contenedor cuyo nombre ya exista en la lista de contenedores del usuario
                var c = await Contenedor.findOne({_id: cont});
                console.log(c);
                if(c.nombre.toLowerCase() == req.body.nombre.toLowerCase()){
                    console.log('error nombre repetido');
                    req.flash('err', 'Ya existe un contenedor con este nombre en su lista de contenedores');
                    return res.redirect('/contenedores/nuevo?clang=' + clang);
                }
            }
            
            const contenedor = new Contenedor({
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                usuario_id: req.user.id,
                fechaCreacion: Date.now()
            });
            console.log(contenedor);
            await contenedor.save();

            // Añadimos el contenedor a la lista de contenedores del usuario
            var usuario = await Usuario.findOne({_id: req.user.id});
            usuario.contenedores.push(contenedor.id);
            await usuario.save();

            req.flash('success', 'Contenedor creado');// Mensaje de éxito, sale en la vista de la siguiente línea
            res.redirect('/usuario?clang=' + clang);
        }
        else{
            res.redirect('/');
        }
    }catch(error){
        console.log(error);
        res.redirect('/');
    }
});

// Pantalla de contenedor (donde estaría el kanban)
router.get('/contenedor/:id', async (req, res, next) => {
    try{
        var contenedor = await Contenedor.findOne({_id: req.params.id});
        if(req.isAuthenticated() && req.user.id == contenedor.usuario_id){// Controla que el contenedor pertenece al usuario loggeado, no permite el acceso si no es el caso
            req.session.clang = req.query.clang;// Guarda la preferencia de idioma en la sesión, evita que clang salga undefined
            var tareas = await Tarea.find({contenedor_id: req.params.id});// Se buscan las tareas asociadas con el contenedor
            console.log(contenedor);
            console.log(tareas);
            res.render('pantallaContenedor', {contenedor, tareas});
        }
        else{
            req.flash('route', 'Acceso no permitido/ruta incorrecta');
            res.redirect('/');
        }
    }catch(error){
        console.log(error);
        res.redirect('/');
    }
});

router.get('/contenedor/update/:id', async (req, res, next) => {
    try{
        var contenedor = await Contenedor.findOne({_id: req.params.id});
        if(req.isAuthenticated() && req.user.id == contenedor.usuario_id){// Controla que el contenedor pertenece al usuario loggeado, no permite el acceso si no es el caso
            req.session.clang = req.query.clang;// Guarda la preferencia de idioma en la sesión, evita que clang salga undefined
            console.log(contenedor);
            res.render('pantallaContenedorEdit', {contenedor});
        }
        else{
            req.flash('route', 'Acceso no permitido/ruta incorrecta');
            res.redirect('/');
        }
    }catch(error){
        console.log(error);
        res.redirect('/');
    }
});

// Post de modificación de contenedor (solo nombre y descripción, las tareas se gestionan directamente en pantallaContenedor)
router.post('/contenedor/edit/:id', async (req, res, next) => {
    try{
        const clang = req.session.lang;// Asigna la preferencia de idioma de la sesión a clang, para luego construir la ruta
        var contenedorEdit = await Contenedor.findOne({_id: req.params.id});
        var usuarioContenedor = await Usuario.findOne({_id: contenedorEdit.usuario_id});
        console.log(usuarioContenedor.contenedores);
        for(var contenedor of usuarioContenedor.contenedores){// Impedimos que se edite un contenedor con el nombre igual al de otro, excepto si es el mismo que estamos editando
            var c = await Contenedor.findOne({_id: contenedor});
            console.log(c);
            if(req.params.id != contenedor && c.nombre.toLowerCase() == req.body.nombre.toLowerCase()){
                console.log('error nombre repetido');
                req.flash('err', 'Ya existe un contenedor con este nombre en su lista de contenedores');
                return res.redirect('/contenedor/update/' + req.params.id + '?clang=' + clang);
            }
        }
        
        await Contenedor.findOneAndUpdate({_id: req.params.id}, req.body);// Se utiliza findOneAndUpdate por ser más simple de entender
        console.log('Datos cambiados');// Mensaje por consola provisional

        req.flash('success', 'Contenedor editado');// Mensaje de éxito, sale en la vista de la siguiente línea
        res.redirect('/usuario?clang=' + clang);// Se reconstruye la ruta entera anterior para que respete el idioma establecido
    }catch(error){
        console.log(error);
        res.redirect('/');
    }
});

// Ruta de borrado de contenedor
router.get('/contenedor/delete/:id', async (req, res, next) => {
    try{
        var contenedorDelete = await Contenedor.findOne({_id: req.params.id});// Buscamos el contenedor
        if(req.isAuthenticated() && req.user.id == contenedorDelete.usuario_id){
            req.session.clang = req.query.clang;
            const clang = req.session.lang;// Asigna la preferencia de idioma de la sesión a clang, para luego construir la ruta
            console.log(contenedorDelete);
            console.log(contenedorDelete._id);
            var todasTareas = await Tarea.find();// Buscamos todas las tareas
            var tareasDelete = [];// Inicializamos un array de tareas a borrar, que rellenamos después

            for(var tarea of todasTareas){
                if(tarea.contenedor_id.toString() == contenedorDelete._id.toString()){
                    tareasDelete.push(tarea);
                }
            }

            console.log(tareasDelete);

            for(var tarea of tareasDelete){// Borramos las tareas de la lista
                await tarea.deleteOne();
            }

            await contenedorDelete.deleteOne();// Borramos el contenedor

            // Quitamos el contenedor de la lista de contenedores del usuario
            var usuario = await Usuario.findOne({_id: req.user.id});
            usuario.contenedores.pull(req.params.id);
            await usuario.save();

            req.flash('success', 'Contenedor borrado');// Mensaje de éxito, sale en la vista de la siguiente línea
            return res.redirect('/usuario?clang=' + clang);// Se reconstruye la ruta entera anterior para que respete el idioma establecido, se redirige al inicio, a signin

        }
        else{
            req.flash('route', 'Acceso no permitido/ruta incorrecta');
            res.redirect('/');
        }
    }catch(error){
        console.log(error);
        res.redirect('/');
    }
});

module.exports = router;