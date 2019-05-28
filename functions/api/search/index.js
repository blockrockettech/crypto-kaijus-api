const _ = require('lodash');

const cryptoKaijusTokenService = require('../../services/cryptoKaijusToken.service');

const search = require('express').Router({mergeParams: true});

search.get('/id/:tokenId', async (req, res, next) => {
    try {
        const network = req.params.network;
        const tokenId = req.params.tokenId;

        const details = await cryptoKaijusTokenService.getTokenDetails(network, tokenId);

        return res.status(200).json(details);
    } catch (e) {
        next(e);
    }
});

search.get('/nfc/:nfcId', async (req, res, next) => {
    try {
        const network = req.params.network;
        const nfcId = req.params.nfcId;

        const details = await cryptoKaijusTokenService.getNfcDetails(network, nfcId);

        return res.status(200).json(details);
    } catch (e) {
        next(e);
    }
});

module.exports = search;
