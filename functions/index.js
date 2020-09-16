const functions = require('firebase-functions');

const cors = require('cors');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// app.use(require('./api/logger'));

// const CORS_WHITELIST = [
//     'http://0.0.0.0:3000',
//     'http://localhost:3000',
//     'https://dapp.cryptokaiju.io',
//     'https://cryptokaiju.io',
//     'https://cryptokaiju-39233.firebaseapp.com',
//     'https://cryptokaiju-39233.web.app'
// ];
//
// const corsOptions = {
//     origin: function (origin, callback) {
//         console.log('Checking origin', origin);
//         const originIsWhitelisted = CORS_WHITELIST.indexOf(origin) !== -1;
//         if (!originIsWhitelisted && origin) {
//             console.error('Incoming API request from non-whitelisted domain', origin);
//         }
//         callback(null, originIsWhitelisted ? {origin: true} : {origin: false});
//     }
// };

app.use(cors());

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
main.use(cors());
main.use('/api', app);

// Expose Express API as a single Cloud Function:
exports.main = functions
    .runWith({
        timeoutSeconds: 300,
        memory: '1GB'
    })
    .https
    .onRequest(main);
