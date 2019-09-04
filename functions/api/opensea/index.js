const _ = require('lodash');

const openSeaApi = require('../../services/opensea.service');

const openSea = require('express').Router({mergeParams: true});

openSea.get('/id/:tokenId', async (req, res, next) => {
    try {
        const tokenId = req.params.tokenId;
        const network = req.params.network;

        const details = await openSeaApi.getAssetDetails(network, tokenId);

        return res.status(200).json(details);
    } catch (e) {
        next(e);
    }
});

openSea.get('/search/kitty-data/:tokenId', async (req, res, next) => {
    try {
        const tokenId = req.params.tokenId;

        const details = await openSeaApi.getCryptiKittyDetails(tokenId);

        return res.status(200).json(details);
    } catch (e) {
        next(e);
    }
});

module.exports = openSea;
