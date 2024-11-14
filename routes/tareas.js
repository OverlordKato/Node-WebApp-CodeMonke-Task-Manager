var express = require('express');
var router = express.Router();
const Tarea = require('../models/tarea');
const Contenedor = require('../models/contenedor');
const Usuario = require('../models/usuario');

// Pantalla de creación de tarea
router.get('/tareas/nueva/:idContenedor', async (req, res, next) => {// Cambiado de "tarea" a "tareas" para evitar errores a largo plazo
    try{
        var contenedor = await Contenedor.findOne({_id: req.params.idContenedor});
        if(req.isAuthenticated() && req.user.id == contenedor.usuario_id){// Controla que el contenedor pertenece al usuario loggeado, no permite el acceso si no es el caso
            req.session.clang = req.query.clang;// Guarda la preferencia de idioma en la sesión, evita que clang salga undefined
            res.render('pantallaTareaCreate', {contenedor});
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

// Post de creación de tarea
router.post('/tarea/create/:idContenedor', async (req, res, next) => {
    try{
        if(req.isAuthenticated()){
            req.session.clang = req.query.clang;// Guarda la preferencia de idioma en la sesión, evita que clang salga undefined
            const clang = req.session.lang;// Asigna la preferencia de idioma de la sesión a clang, para luego construir la ruta
            
            var hashtags = req.body.hashtags;
            var hashtagsArray = hashtags.split(',').map(caracter => caracter.replace(/[\s#]/g, ''));// Parcialmente sacado de: https://stackoverflow.com/questions/39624581/javascript-replace-characters-of-an-element-in-an-array y https://stackoverflow.com/questions/16576983/replace-multiple-characters-in-one-replace-call, separa etiquetas ignorando espacios en blanco y #
            console.log(hashtagsArray);
            var etiquetasArray = [];
            hashtagsArray.forEach(hashtag => {
                if(hashtag.length <= 16 && etiquetasArray.length < 3){// Guarda etiquetas si son de 16 caracteres o menos, y no existen 3 en el array
                    etiquetasArray.push(hashtag);
                }
            });

            const tarea = new Tarea({
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                contenedor_id: req.params.idContenedor,
                fechaCreacion: Date.now(),
                estado: "Pendiente",
                etiquetas: etiquetasArray
            });
            console.log(tarea);
            await tarea.save();

            // Añadimos la tarea a la lista de tareas del contenedor
            var contenedor = await Contenedor.findOne({_id: req.params.idContenedor});
            contenedor.tareas.push(tarea.id);
            await contenedor.save();

            req.flash('success', 'Tarea creada');// Mensaje de éxito, sale en la vista de la siguiente línea
            res.redirect('/contenedor/' + req.params.idContenedor + '/?clang=' + clang);
        }
        else{
            res.redirect('/');
        }
    }catch(error){
        console.log(error);
        res.redirect('/');
    }
});

// Ruta de visualización de tarea
router.get('/tarea/view/:idTarea/:idContenedor', async (req, res, next) => {
    try{
        var contenedor = await Contenedor.findOne({_id: req.params.idContenedor});// Busca el contenedor que contiene la tarea
        var tareaView = await Tarea.findOne({_id: req.params.idTarea});// Busca la tarea
        if(req.isAuthenticated() && (req.user.id == contenedor.usuario_id && req.params.idContenedor == tareaView.contenedor_id)){
            req.session.clang = req.query.clang;
            
            res.render('pantallaTarea', {tareaView, contenedor});// Actualizamos la página usando el id del contenedor en la ruta
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

// Ruta de edición de tarea
router.get('/tarea/edit/:idTarea/:idContenedor', async (req, res, next) => {
    try{
        var contenedor = await Contenedor.findOne({_id: req.params.idContenedor});// Busca el contenedor que contiene la tarea
        var tareaEdit = await Tarea.findOne({_id: req.params.idTarea});// Busca la tarea
        if(req.isAuthenticated() && (req.user.id == contenedor.usuario_id && req.params.idContenedor == tareaEdit.contenedor_id)){
            req.session.clang = req.query.clang;
            
            res.render('pantallaTareaEdit', {tareaEdit, contenedor});// Actualizamos la página usando el id del contenedor en la ruta
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

// Post de edición de tarea
router.post('/tarea/edit/:idTarea/:idContenedor', async (req, res, next) => {
    try{
        if(req.isAuthenticated()){
            req.session.clang = req.query.clang;// Guarda la preferencia de idioma en la sesión, evita que clang salga undefined
            const clang = req.session.lang;// Asigna la preferencia de idioma de la sesión a clang, para luego construir la ruta

            var hashtags = req.body.hashtags;
            var hashtagsArray = hashtags.split(',').map(caracter => caracter.replace(/[\s#]/g, ''));// Parcialmente sacado de: https://stackoverflow.com/questions/39624581/javascript-replace-characters-of-an-element-in-an-array y https://stackoverflow.com/questions/16576983/replace-multiple-characters-in-one-replace-call, separa etiquetas ignorando espacios en blanco y #
            console.log(hashtagsArray);
            var etiquetasArray = [];
            hashtagsArray.forEach(hashtag => {
                if(hashtag.length <= 16 && etiquetasArray.length < 3){// Guarda etiquetas si son de 16 caracteres o menos, y no existen 3 en el array
                    etiquetasArray.push(hashtag);
                }
            });

            await Tarea.updateOne({_id: req.params.idTarea}, {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                etiquetas: etiquetasArray
            });

            req.flash('success', 'Tarea editada');// Mensaje de éxito, sale en la vista de la siguiente línea
            res.redirect('/contenedor/' + req.params.idContenedor + '?clang=' + clang);
        }
        else{
            res.redirect('/');
        }
    }catch(error){
        console.log(error);
        res.redirect('/');
    }
});

// Ruta de borrado de tarea
router.get('/tarea/delete/:idTarea/:idContenedor', async (req, res, next) => {
    try{
        if(req.isAuthenticated()){
            req.session.clang = req.query.clang;
            const clang = req.session.clang;// Asigna la preferencia de idioma de la sesión a clang, para luego construir la ruta
            var tareaDelete = await Tarea.findOne({_id: req.params.idTarea});// Busca la tarea

            await tareaDelete.deleteOne();// Borramos la tarea

            // Quitamos la tarea de la lista de tareas del contenedor
            var contenedor = await Contenedor.findOne({_id: req.params.idContenedor});
            contenedor.tareas.pull(req.params.idTarea);
            await contenedor.save();
            
            req.flash('success', 'Tarea borrada');// Mensaje de éxito, sale en la vista de la siguiente línea
            res.redirect('/contenedor/' + req.params.idContenedor + '?clang=' + clang);// Actualizamos la página usando el id del contenedor en la ruta
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

// Ruta actualización Kanban
router.post('/tarea/kanban/:id', async (req, res, next) => {
    try{
        if(req.isAuthenticated()){
            await Tarea.updateOne({_id: req.params.id}, {
                estado: req.body.estado
            });
        }
        else{
            res.redirect('/');
        }
    }catch(error){
        console.log(error);
        res.redirect('/');
    }
});

module.exports = router;