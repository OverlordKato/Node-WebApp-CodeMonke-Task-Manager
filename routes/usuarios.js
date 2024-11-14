var express = require('express');
var router = express.Router();
require('../passport/local-auth');// Añadido un require para que encuentre el local-auth, no lo estaba haciendo automáticamente
var passport = require('passport');
var bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');
const Contenedor = require('../models/contenedor');
const Tarea = require('../models/tarea');

// Pantalla de Inicio de la aplicación (SIGN IN/ SIGN UP)
router.get('/', (req, res, next) => {
    req.session.clang = req.query.clang;
    const clang = req.session.clang;
    if(req.isAuthenticated()){
        res.redirect('/usuario?clang=' + clang);// Se reconstruye la ruta entera anterior para que respete el idioma establecido
    }
    else{
        res.render('signin');
    }
});

// Método POST para iniciar sesión
// Cómo insertar una función de la que forma parte authenticate: https://stackoverflow.com/questions/71110910/how-to-perform-a-function-before-a-redirect-with-passport-authenticate
router.post('/signin', function(req, res, next) {
    req.session.clang = req.query.clang;// Guarda la preferencia de idioma en la sesión, evita que clang salga undefined
    passport.authenticate('local-signin', function(err, user, info) {
        if (err) { 
            return next(err); 
        }
        if (!user) { 
            return res.redirect('/'); 
        }
        req.logIn(user, function(err) {
            if (err) { 
                return next(err); 
            }
            const clang = req.session.clang;
            return res.redirect('/usuario?clang=' + clang);
        });
    })(req, res, next);
});

//Método GET de la pantalla singUp
router.get('/signup', (req, res, next) => {
    const clang = req.session.clang;
    if(req.isAuthenticated()){
        res.redirect('/usuario?clang=' + clang);// Se reconstruye la ruta entera anterior para que respete el idioma establecido
    }
    else{
        res.render('signup');
    }
});

// Método POST para crear un usuario
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
}));

// Para hacer logout del usuario en la sesión
router.get('/logout', (req, res, next) => {
    const clang = req.session.clang;
    req.logout(function(err) {// Daba error si no se ponía un callback
        if (err) {
          console.log(err);
          return next(err);
        }
        return res.redirect('/?clang=' + clang);// Se reconstruye la ruta entera anterior para que respete el idioma establecido
    });
});

// Pantalla principal del usuario (Ve y puede acceder a sus contenedores)
router.get('/usuario', async (req, res, next) => {
    try{
        if(req.isAuthenticated()){
            req.session.clang = req.query.clang;// Guarda la preferencia de idioma en la sesión, evita que clang salga undefined
            var contenedores = await Contenedor.find({usuario_id: req.user.id});// Buscaa todos los contenedores del usuario
            res.render('pantallaMain', {UsuarioActual: req.user, contenedores});
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

// Pantalla de perfil de usuario (datos personales)
router.get('/usuario/perfil', async (req, res, next) => {
    try{
        if(req.isAuthenticated()){
            req.session.clang = req.query.clang;// Guarda la preferencia de idioma en la sesión, evita que clang salga undefined
            res.render('pantallaPerfil', {UsuarioActual: req.user});
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

// Pantalla de edición de datos de usuario (datos personales, no incluye cambio de contraseña)
router.get('/usuario/edit/datos', async (req, res, next) => {
    try{
        if(req.isAuthenticated()){
            req.session.clang = req.query.clang;// Guarda la preferencia de idioma en la sesión, evita que clang salga undefined
            res.render('pantallaEditDatos', {UsuarioEditDatos: req.user});
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

// Post para la edición de datos de usuario, redirige a la pantalla de perfil de usuario, la cual se reconstruye para evitar problemas con el idioma
router.post('/usuario/edit/datos', async (req, res, next) => {
    try{
        const clang = req.session.clang;// Asigna la preferencia de idioma de la sesión a clang, para luego construir la ruta
        const usuarios = await Usuario.find();
        for (var usuario of usuarios) {
            if(usuario.id != req.user.id && usuario.aliasUsuario.toLowerCase() == req.body.aliasUsuario.toLowerCase()){// Recorremos la lista de usuarios y, a no ser que sea el mismo que el actual, si el email o alias coincide da error y no se cambia
                req.flash('err', 'Este alias ya existe, inténtelo de nuevo');
                return res.redirect('/usuario/edit/datos?clang=' + clang);
            }
            if(usuario.id != req.user.id && usuario.email.toLowerCase() == req.body.email.toLowerCase()){// Recorremos la lista de usuarios y, a no ser que sea el mismo que el actual, si el email o alias coincide da error y no se cambia
                req.flash('err', 'Este email ya existe, inténtelo de nuevo');
                return res.redirect('/usuario/edit/datos?clang=' + clang);
            }
        }
        await Usuario.findOneAndUpdate({_id: req.user.id}, req.body);// Se utiliza findOneAndUpdate por ser más simple de entender
        req.flash('success', 'Datos cambiados');// Mensaje de éxito, sale en la vista de la siguiente línea
        res.redirect('/usuario/perfil?clang=' + clang);// Se reconstruye la ruta entera anterior para que respete el idioma establecido
    }catch(error){
        console.log(error);
        res.redirect('/');
    }
});

// Pantalla de edición de contraseña de usuario
router.get('/usuario/edit/pass', async (req, res, next) => {
    try{
        if(req.isAuthenticated()){
            req.session.clang = req.query.clang;// Guarda la preferencia de idioma en la sesión, evita que clang salga undefined
            res.render('pantallaEditPass', {UsuarioEditPass: req.user});
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

// Post para la edición de contraseña de usuario, redirige a la pantalla de perfil de usuario, la cual se reconstruye para evitar problemas con el idioma
// Código parcialmente sacado de la siguiente página, quitando los callbacks porque daban problemas: https://stackoverflow.com/questions/63963246/bcrypt-mongoose-change-user-password
router.post('/usuario/edit/pass', async (req, res, next) => {
    try {
        const clang = req.session.clang;// Asigna la preferencia de idioma de la sesión a clang, para luego construir la ruta

        if (!req.body.passActual || !req.body.passNuevo || !req.body.passNuevoRepetir) {// Verifica que no hayan campos vacíos
            req.flash('err', 'Existía/n uno o varios campo/s vacío/s, inténtelo de nuevo.');
            return res.redirect('/usuario/edit/pass?clang=' + clang);
        }
        var UsuarioEditPass = await Usuario.findOne({ _id: req.user.id });// Se busca y guarda el usuario en una variable
        const isMatch = await bcrypt.compare(req.body.passActual, UsuarioEditPass.password);// Compara contraseñas
        if (!isMatch) {
            req.flash('err', 'La contraseña actual es incorrecta, inténtelo de nuevo.');
            return res.redirect('/usuario/edit/pass?clang=' + clang);
        }
        if(req.body.passNuevo != req.body.passNuevoRepetir) {
            req.flash('err', 'Las contraseñas nuevas no coinciden, inténtelo de nuevo.');
            return res.redirect('/usuario/edit/pass?clang=' + clang);
        }

        const salt = await bcrypt.genSalt(13);
        const hash = await bcrypt.hash(req.body.passNuevo, salt);// Crea el hash
        UsuarioEditPass.password = hash;// Cambia la contraseña del usuario
        await UsuarioEditPass.save();// Guarda el usuario en la base de datos
        req.flash('success', 'Contraseña actualizada');// Mensaje de éxito, sale en la vista de la siguiente línea
        return res.redirect('/usuario/perfil?clang=' + clang);
    } catch (error) {
        console.log(error);
        return res.redirect('/');
    }
});

// Ruta para la vista de doble confirmación para borrar al usuario
router.get('/usuario/comprobacion', async (req, res, next) => {
    try{
        if(req.isAuthenticated()){
            req.session.clang = req.query.clang;// Guarda la preferencia de idioma en la sesión, evita que clang salga undefined
            res.render('pantallaComprobacion', {UsuarioDelete: req.user});
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

// Ruta de borrado de usuario, sólo funciona correctamente si se hace con post en vez de get
router.post('/usuario/delete', async (req, res, next) => {
    passport.authenticate('local-signin', async (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/usuario/comprobacion?clang=' + req.session.clang);
        }

        try{
            if(req.isAuthenticated()){
                req.session.clang = req.query.clang;
                const clang = req.session.clang;// Asigna la preferencia de idioma de la sesión a clang, para luego construir la ruta
                var UsuarioDelete = await Usuario.findOne({_id: req.user.id});// Buscamos el usuario a borrar, siempre es el que está logged in
                var contenedoresDelete = await Contenedor.find({usuario_id: req.user.id});// Buscamos los contenedores asociados al usuario

                // Hacemos un doble bucle for para buscar todas las tareas asociadas a los contenedores que queremos borrar y guardarlas en el array de tareas a borrar
                for(var contenedor of contenedoresDelete){
                    await Tarea.deleteMany({contenedor_id: contenedor.id});
                }

                for(var contenedor of contenedoresDelete){// Borramos los contenedores de la lista
                    await contenedor.deleteOne();
                }

                await UsuarioDelete.deleteOne();// Borramos el usuario

                req.logout(function(err) {// Hacemos un logout antes de volver a la página inicial para que la app no responda como si hubiese un usuario logged in
                    if (err) {
                    console.log(err);
                    return next(err);
                    }
                    req.flash('route', 'Usuario eliminado');
                    return res.redirect('/?clang=' + clang);// Se reconstruye la ruta entera anterior para que respete el idioma establecido, se redirige al inicio, a signin
                });
            }
            else{
                res.redirect('/');
            }
        }catch(error){
            console.log(error);
            res.redirect('/');
        }
    })(req, res, next);
});

module.exports = router;