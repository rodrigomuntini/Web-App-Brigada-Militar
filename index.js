const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
var session = require('express-session');
var auth = require('./middleware/auth');

var vehiclesRouter = require('./routes/vehicles');
var agriculturalMachinesRouter = require ('./routes/agricultural_machines');
var propertyTypesRouter = require ('./routes/property_types');
var visitsRouter = require('./routes/visits');
var propertiesRouter = require('./routes/properties');
var usersRouter = require('./routes/users');
var ownersRouter = require('./routes/owners');

// SERVER CONFIGURATION
var port = process.env.PORT || 3000;

let env = nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

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
    url: "https://novo-rumo-api.herokuapp.com/api/auth/login",
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