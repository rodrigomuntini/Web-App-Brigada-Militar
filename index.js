const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
var session = require('express-session');
var auth = require('./middleware/auth');

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
  res.render("index.html");
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
  res.render("home.html");
});

// Users
app.get("/users", (req, res) => {

  // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjcxNjgyMzEsImV4cCI6MTY2NzE4OTgzMSwibmJmIjoxNjY3MTY4MjMxLCJqdGkiOiI5MkVMMjZSOW5MSE1UR2xLIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.omwW3-31UZ40SvTF3-1rgmUc1JqKHIOOsmS78Z8vZEM";

  let success_message = "";

  if (req.session.success_message) {
    success_message = req.session.success_message;
    delete req.session.success_message;
  }

  let page = req.query.page || 1;
  let search = req.query.search ? "&search=" + req.query.search : "";

  $.ajax({
    type: "GET",
    url: "https://novo-rumo-api.herokuapp.com/api/users?page=" + page + search,
    headers: {
      'Authorization': 'bearer ' + req.session.token
    },
    success: function (data) {
      return res.render("users/list.html",{
        users: data.users,
        message: success_message,
        page: data.page,
        last_page: data.last_page,
        total: data.total,
        search: data.search
      });
    },
    error: function (error) {
      return res.redirect("/login?error=Unauthorized");
    },
  });
});

app.get("/users/add", (req, res) => {
  res.render("users/add.html");
});

app.post("/users/add", (req, res) => {

  // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjY5NjA1ODMsImV4cCI6MTY2Njk4MjE4MywibmJmIjoxNjY2OTYwNTgzLCJqdGkiOiJlSVpidUowOWwzYUVwWE5UIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.T9NWr14eqtF1tdHcLBcbA0ZXQij-lwdjY4N008wXSK0";

  $.ajax({
    type: "POST",
    url: "https://novo-rumo-api.herokuapp.com/api/users/add",
    headers: {
      'Authorization': 'bearer ' + req.session.token
    },
    data: req.body,
    success: function (data) {
      req.session.success_message = "Servidor criado com sucesso!"
      return res.redirect('/users');
    },
    error: function (error) {
      console.log(error);
      return res.render('users/add.html', { 'request_body': req.body, 'error': error.responseJSON.error })
    },
  });
});

app.get("/users/edit/:id", (req, res) => {
  // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjcxNjgyMzEsImV4cCI6MTY2NzE4OTgzMSwibmJmIjoxNjY3MTY4MjMxLCJqdGkiOiI5MkVMMjZSOW5MSE1UR2xLIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.omwW3-31UZ40SvTF3-1rgmUc1JqKHIOOsmS78Z8vZEM";

  $.ajax({
    type: "GET",
    url: "https://novo-rumo-api.herokuapp.com/api/users/show/" + req.params.id,
    headers: {
      'Authorization': 'bearer ' + req.session.token
    },
    success: function (data) {
      res.render("users/edit.html", { 'request_body': data.user });
    },
  });
});

app.post("/users/edit/:id", (req, res) => {
  // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjcxNjgyMzEsImV4cCI6MTY2NzE4OTgzMSwibmJmIjoxNjY3MTY4MjMxLCJqdGkiOiI5MkVMMjZSOW5MSE1UR2xLIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.omwW3-31UZ40SvTF3-1rgmUc1JqKHIOOsmS78Z8vZEM";

  $.ajax({
    type: "POST",
    url: "https://novo-rumo-api.herokuapp.com/api/users/edit/" + req.params.id,
    headers: {
      'Authorization': 'bearer ' + req.session.token
    },
    data: req.body,
    success: function (data) {
      console.log(data);
      req.session.success_message = "Servidor alterado com sucesso!"
      return res.redirect('/users');
    },
    error: function (error) {
      console.log(error);
      req.body._id = req.params.id;
      return res.render('users/edit.html', { 'request_body': req.body, 'error': error.responseJSON.error })
    },
  });
});

app.post("/users/delete/:id", (req, res) => {
  // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjcxNjgyMzEsImV4cCI6MTY2NzE4OTgzMSwibmJmIjoxNjY3MTY4MjMxLCJqdGkiOiI5MkVMMjZSOW5MSE1UR2xLIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.omwW3-31UZ40SvTF3-1rgmUc1JqKHIOOsmS78Z8vZEM";

  $.ajax({
    type: "DELETE",
    url: "https://novo-rumo-api.herokuapp.com/api/users/delete/" + req.params.id,
    headers: {
      'Authorization': 'bearer ' + req.session.token
    },
    success: function (data) {
      console.log(data);
      return res.send(true);
    },
    error: function (error) {
      console.log(error);
      return res.send(false);
    },
  });
});

// Visits
app.get("/visits", (req, res) => {

  req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2Njc0OTc2NzYsImV4cCI6MTY2NzUxOTI3NiwibmJmIjoxNjY3NDk3Njc2LCJqdGkiOiJWUFhIZHBSaVZpR2RkYUE0Iiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.kylvyuj5QAIeoLafYMxL1bi5UBWgUaRUHA108K0z6rI";

  let success_message = "";

  if (req.session.success_message) {
    success_message = req.session.success_message;
    delete req.session.success_message;
  }

  let page = req.query.page || 1;
  let search = req.query.search ? "&search=" + req.query.search : "";

  $.ajax({
    type: "GET",
    url: "https://novo-rumo-api.herokuapp.com/api/visits?page=" + page + search,
    headers: {
      'Authorization': 'bearer ' + req.session.token
    },
    success: function (data) {
      return res.render("visits/list.html",{
        visits: data.visits,
        message: success_message,
        page: data.page,
        last_page: data.last_page,
        total: data.total,
        search: data.search
      });
    },
    error: function (error) {
      return res.redirect("/login?error=Unauthorized");
    },
  });
});

//Owners
app.get("/owners", (req, res) => {

  req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NTE2NjU2LCJleHAiOjE2Njc1MzgyNTYsIm5iZiI6MTY2NzUxNjY1NiwianRpIjoiY0Nsem5ZNGRaUU1LZXVLZiIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.QTF6UHCaaadOQua-tL8tKToVXQfNhOqm4RCFB-gcFWU";

  let success_message = "";

  if (req.session.success_message) {
    success_message = req.session.success_message;
    delete req.session.success_message;
  }

  let page = req.query.page || 1;
  let search = req.query.search ? "&search=" + req.query.search : "";

  $.ajax({
    type: "GET",
    url: "https://novo-rumo-api.herokuapp.com/api/owners?page=" + page + search,
    headers: {
      'Authorization': 'bearer ' + req.session.token
    },
    success: function (data) {
      console.log(data.users)
      return res.render("owners/list.html",{
        owners: data.users,
        message: success_message,
        page: data.page,
        last_page: data.last_page,
        total: data.total,
        search: data.search
      });
    },
    error: function (error) {
      return res.redirect("/login?error=Unauthorized");
    },
  });
});

app.get("/owners/add", (req, res) => {
  res.render("owners/add.html");
});

app.post("/owners/add", (req, res) => {

  // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjY5NjA1ODMsImV4cCI6MTY2Njk4MjE4MywibmJmIjoxNjY2OTYwNTgzLCJqdGkiOiJlSVpidUowOWwzYUVwWE5UIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.T9NWr14eqtF1tdHcLBcbA0ZXQij-lwdjY4N008wXSK0";

  $.ajax({
    type: "POST",
    url: "https://novo-rumo-api.herokuapp.com/api/owners/add",
    headers: {
      'Authorization': 'bearer ' + req.session.token
    },
    data: req.body,
    success: function (data) {
      req.session.success_message = "Servidor criado com sucesso!"
      return res.redirect('/owners');
    },
    error: function (error) {
      console.log(error);
      return res.render('users/add.html', { 'request_body': req.body, 'error': error.responseJSON.error })
    },
  });
});

app.get("/owners/edit/:id", (req, res) => {
  // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjcxNjgyMzEsImV4cCI6MTY2NzE4OTgzMSwibmJmIjoxNjY3MTY4MjMxLCJqdGkiOiI5MkVMMjZSOW5MSE1UR2xLIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.omwW3-31UZ40SvTF3-1rgmUc1JqKHIOOsmS78Z8vZEM";

  $.ajax({
    type: "GET",
    url: "https://novo-rumo-api.herokuapp.com/api/owners/show/" + req.params.id,
    headers: {
      'Authorization': 'bearer ' + req.session.token
    },
    success: function (data) {
      res.render("owners/edit.html", { 'request_body': data.user });
    },
  });
});

app.post("/owners/edit/:id", (req, res) => {
  // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjcxNjgyMzEsImV4cCI6MTY2NzE4OTgzMSwibmJmIjoxNjY3MTY4MjMxLCJqdGkiOiI5MkVMMjZSOW5MSE1UR2xLIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.omwW3-31UZ40SvTF3-1rgmUc1JqKHIOOsmS78Z8vZEM";

  $.ajax({
    type: "POST",
    url: "https://novo-rumo-api.herokuapp.com/api/owners/edit/" + req.params.id,
    headers: {
      'Authorization': 'bearer ' + req.session.token
    },
    data: req.body,
    success: function (data) {
      console.log(data);
      req.session.success_message = "Servidor alterado com sucesso!"
      return res.redirect('/owners');
    },
    error: function (error) {
      console.log(error);
      req.body._id = req.params.id;
      return res.render('owners/edit.html', { 'request_body': req.body, 'error': error.responseJSON.error })
    },
  });
});

app.post("/owners/delete/:id", (req, res) => {
  // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjcxNjgyMzEsImV4cCI6MTY2NzE4OTgzMSwibmJmIjoxNjY3MTY4MjMxLCJqdGkiOiI5MkVMMjZSOW5MSE1UR2xLIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.omwW3-31UZ40SvTF3-1rgmUc1JqKHIOOsmS78Z8vZEM";

  $.ajax({
    type: "DELETE",
    url: "https://novo-rumo-api.herokuapp.com/api/owners/delete/" + req.params.id,
    headers: {
      'Authorization': 'bearer ' + req.session.token
    },
    success: function (data) {
      console.log(data);
      return res.send(true);
    },
    error: function (error) {
      console.log(error);
      return res.send(false);
    },
  });
});