const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );

// SERVER CONFIGURATION
var port = process.env.PORT || 3000;

let env = nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.set('engine', env);
require('useful-nunjucks-filters')(env);

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({   // to support URL-encoded bodies
    extended: true
}));

app.use(express.static('public'));

app.listen(port, () => {
    console.log('info', 'LISTEN ON PORT ' + port);
});

app.get('/teste', (req, res) => {
  res.render('teste.html')
});

app.get('/login', (req, res) => {
  res.render('login.html')
});

app.post('/login-verify', (req, res) => {
  var params = req.body;
  console.log(params)
  var email = params.email
  var password = params.password

  if (email == "") {
    res.redirect('/login?error=email empty')
  } 
  if (password == "") {
    res.redirect('/login?error=password empty')
  } 
  var data = {
    "email": email,
    "password": password
  }

  $.ajax({
    type: "POST",
    url: 'https://novo-rumo-api.herokuapp.com/api/auth/login',
    data: data,
    success: function (data) {
        console.log(data);
        if (data.access_token) {
            console.log("Login OK");
            // mandar para a página inicial
        }
    },
    error: function (error) {
        console.log("error: ", error);
        error.statusText == "Unauthorized" ? error.statusText = "Não autorizado" : error.statusText = "Erro de processamento interno";
        console.log(error.statusText);
        res.redirect("/login?error=Unauthorized")
    }
});

});

app.get('/', (req, res) => {
  res.render('index.html')
});