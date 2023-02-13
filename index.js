// backend of my personal website

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const connectRouter = require('./routes/connect/backend');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use('/', connectRouter);

// lancement du serveur port 8080
app.use(function(req, res, next) {
  var err = new Error ('Not Found');
  err.status = 404;
  next(err);
});

let server = app.listen( process.env.PORT || 8080, function() {
  console.log('Listening on port', server.address().port);
});