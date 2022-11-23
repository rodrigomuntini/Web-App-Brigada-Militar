const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
var session = require('express-session');
var auth = require('./middleware/auth');
var mongoconnect = require('./mongodb/mongodb');
const nodeoutlook = require('nodejs-nodemailer-outlook')

var vehiclesRouter = require('./routes/vehicles');
var agriculturalMachinesRouter = require ('./routes/agricultural_machines');
var propertyTypesRouter = require ('./routes/property_types');
var visitsRouter = require('./routes/visits');
var propertiesRouter = require('./routes/properties');
var usersRouter = require('./routes/users');
var ownersRouter = require('./routes/owners');
const { mongo } = require("mongoose");

// SERVER CONFIGURATION
var port = process.env.PORT || 3000;

let env = nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

mongoconnect().catch(err => console.log(err));

app.set("engine", env);
require("useful-nunjucks-filters")(env);

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: false,
}));

app.use(express.static("public"));

app.listen(port, () => {
  console.log("info", "LISTEN ON PORT " + port);
});

app.get("/", (req, res) => {
  res.render("login.html");
});

app.get("/teste", (req, res) => {
  res.render("teste.html");
});

app.get("/login", (req, res) => {
  res.render("login.html");
});

app.post("/login-verify", (req, res) => {
  var params = req.body;
  console.log(params);
  var email = params.email;
  var password = params.password;

  if (email == "") {
    res.redirect("/login?error=email empty");
  }
  if (password == "") {
    res.redirect("/login?error=password empty");
  }
  var data = {
    email: email,
    password: password,
  };

  $.ajax({
    type: "POST",
    url: "http://localhost:8000/api/auth/login",
    data: data,
    success: function (data) {
      console.log(data);
      if (data.access_token) {
        req.session.token = data.access_token;
        return res.redirect('/home');
      }
    },
    error: function (error) {
      console.log("error: ", error);
      error.statusText == "Unauthorized"
        ? (error.statusText = "Não autorizado")
        : (error.statusText = "Erro de processamento interno");
      return res.redirect("/login?error=Unauthorized");
    },
  });
});

app.get("/logout", (req, res) => {
  req.session.token = undefined;

  return res.redirect('/login');
});

app.get("/home", (req, res) => {
  console.log(req.session.token)
  res.redirect('/users');
});

app.use('/vehicles', vehiclesRouter);
app.use('/agricultural-machines', agriculturalMachinesRouter);
app.use('/property-types', propertyTypesRouter);
app.use('/visits', visitsRouter);
app.use('/properties', propertiesRouter);
app.use('/users', usersRouter);
app.use('/owners', ownersRouter);

// POST CONTACT 
app.post('/sendEmail', (req, res) => {
    
  var email = req.body.email;
  var name = req.body.name;
  var subject = req.body.subject;

  req.body.status = false;

  if (email && subject) {
      
      // send email to Client
      nodeoutlook.sendEmail({
          auth: {
              user: "novorumo054@outlook.com",
              pass: "Novorumopm"
          },
          from: 'novorumo054@outlook.com',
          to: email,
          subject: 'Administrador - Novo Rumo',
          html:   '<div style="justify-content-center; text-align: center;">'+
                      '<div><h2>Olá '+ name +'</h2></div>'+
                      '<div style="margin-bottom: 10px;"><h4>Sua senha para o email '+ email +' é: '+ subject +'</h4></div>'+
                      '<div style="margin-bottom: 10px;"><h4>Não compartilhe com ninguém, mantenha-a segura</h4></div>'+
                  '</div>',
          replyTo: 'novorumo054@outlook.com',
          onError: (e) => {
              console.log('Error', 'Send e-mail to client error: ' + e);
          },
          onSuccess: (i) => {
              console.log('info', 'Send e-mail to client: ' + i);
          }
      });
      
      return res.status(200).json({ success: true, result: "Emaio enviado", status: 200 });
      
  } else {
      console.log('error', 'Missing informations on create contact');
  }
 
});