const functions = require('firebase-functions');

const cors = require('cors');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// app.use(require('./api/logger'));

app.use(cors());
app.options('*', cors({origin: false}));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.options('*', cors());

const token = require('./api/token');
const opensea = require('./api/opensea');
const search = require('./api/search');
const homepage = require('./api/homepage');
const image = require('./api/image');

// TOKEN API
app.use('/network/:network/homepage', homepage);
app.use('/network/:network/search', search);
app.use('/network/:network/token', token);
app.use('/network/:network/os', opensea);
app.use('/image', image);

// Create "main" function to host all other top-level functions
const main = express();
main.use('/api', app);

// Expose Express API as a single Cloud Function:
exports.main = functions.https.onRequest(main);
