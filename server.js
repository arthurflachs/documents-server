var express = require('express');
const cors = require('cors');
var defaultPath = require('./fixtures/path.json');

var app = express();

app.use(cors());

app.get('/', (req, res) => res.json(defaultPath));

module.exports = app;
