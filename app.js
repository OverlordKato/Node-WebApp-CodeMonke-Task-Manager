var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var i18n = require("i18n-express");// Para tener varios idiomas en la aplicación
var session = require('express-session');
var flash = require('connect-flash');

//Passport para  el localAuth
var passport = require('passport');

var usuarioRouter = require('./routes/usuarios');
var tareaRouter = require('./routes/tareas');
var contenedorRouter = require('./routes/contenedores');

var app = express();

// Busca Bulma en los archivos node_modules (no funciona de momento)
app.get('/bulma.min.css', (req, res) => {
  res.sendFile(path.join(__dirname, '/node_modules/bulma/css/bulma.min.css'));
});

//Conexión con la base de datos
const mongoose = require('mongoose');
//Para cambiar de base de datos, añadir el nombre de la misma después del .net/
mongoose.connect('mongodb+srv://username:password@server.net/TFG-BDD?retryWrites=true&w=majority',// username, password y server son placeholders, cambiar por datos reales para conexión
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(db => console.log('db connected'))
  .catch(err => console.log(err));
// view engine setup
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Indica las opciones que se utilizan de i18n, se pueden poner más si se necesita
// Documentación oficial: https://www.npmjs.com/package/i18n-express
app.use(i18n({
  translationsPath: path.join(__dirname, 'i18n'), 
  siteLangs: ["en", "es", "fr"],
  defaultLang : "es",
  textsVarName: 'translation'
}));

// Necesario para el uso de sesiones, configuración básica
// Documentación oficial: https://www.npmjs.com/package/express-session
app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

//Los app.use de passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  // Si se ha seleccionado un idioma se almacena en la sesión
  if (req.query.clang) {
    req.session.lang = req.query.clang;
  }

  // Utiliza el idioma seleccionado para la sesión
  if (req.session.lang) {
    res.locals.lang = req.session.lang;
  } else {
    // Idioma predeterminado si no hay uno seleccionado
    req.session.lang = 'es'; 
    res.locals.lang = req.session.lang;
  }

  next();
});

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use('/', usuarioRouter);
app.use('/', tareaRouter);
app.use('/', contenedorRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
