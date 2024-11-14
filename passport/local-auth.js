/*
-- Archivo realizado y editado por Mario Marugán Cancio --

El archivo local-auth.js y la estrategia de cifrado se han cogido de los proyectos
realizados durante el curso. 

Se ha adaptado la estrategia de cifrado para nuestro proyecto,
con el objetivo de cifrar las contraseñas de la aplicación, garantizando una mayor
seguridad para lo ususarios.
 */



const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/usuario');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',// Corregido, daba error si el campo se llamaba emailField
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  console.log('Entrando a local-signup');// Controla que la función se inicializa
  try {
    //Intentamos encontrar al usuario
    var user = new User();// Pasado "Usuario" a "User"
    var user2 = new User();
    user = await User.findOne({ email : email.toLowerCase() });// Pasado "findByID" a "findOne"
    user2 = await User.findOne({ aliasUsuario : req.body.aliasUsuario.toLowerCase() });// Otro usuario para controlar si existe con el mismo alias
    console.log(user + '\n' + user2);// Añadido un console.log para verificar si encuentra a los usuarios
    if(!(req.body.aliasUsuario || email || req.body.password || req.body.password2 || req.body.nombre || req.body.apellido1)){
      // Comprueba que no existan campos vacíos en el usuario, excepto por el segundo apellido. Controlado en HTML, pero se deja por si ocurre algún fallo
      req.flash('err', 'Existían uno o varios campos vacíos. Por favor, inténtelo de nuevo');
      return done(null, false);
    }
    if (user) {
      //Si existe usuario/s, salta un mensaje diciendo que ya exíste el usuario 
      req.flash('err', 'Este correo ya está registrado. Por favor, introduzca otro correo');
      return done(null, false);
    } 
    if (user2) {
      //Si existe usuario/s, salta un mensaje diciendo que ya exíste el usuario 
      req.flash('err', 'Este alias ya está registrado. Por favor, introduzca otro alias');
      return done(null, false);
    }  
    if (req.body.password != req.body.password2){
      // Si las contraseñas no coinciden, retorna un error
      req.flash('err', 'Las contraseñas no coinciden');
      return done(null, false);
    } else {
      //Si no existe, creamos un nuevo usuario.
      const newUser = new User({
        aliasUsuario: req.body.aliasUsuario.toLowerCase(),// Adaptado el nombre para que corresponda al formulario
        email: email.toLowerCase(),
        password: new User().encryptPassword(password), //Encriptación directa con saltSync de 13 ciclos, no funcionaba con newUser
        nombre: req.body.nombre,
        apellido1: req.body.apellido1,
        apellido2: req.body.apellido2,
        contenedores: []
      });
      console.log(newUser);// Imprime los datos del usuario nuevo en consola
      await newUser.save();
      return done(null, newUser);
    }
  //Encapsulación en un Try-Catch para capturar errores
  } catch (error) {
    return done(error);
  }
}));

passport.use('local-signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    var user = new User();// Pasado "Usuario" a "User"
    user = await User.findOne({ email : email });// Pasado "findByID" a "findOne"
    console.log(user);// Añadido un console.log para verificar si encuentra al usuario
    if (!user || !user.comparePassword(password)) {
      //Salta un error si no existe el usuario o la contraseña es incorrecta
      req.flash('err', 'Correo o contraseña incorrectos. Inténtelo de nuevo.');
      return done(null, false);
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

module.exports = passport;
