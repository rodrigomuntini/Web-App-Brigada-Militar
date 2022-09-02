const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');

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

app.get('/', (req, res) => {
  res.render('index.html')
});