const _ = require('lodash');

const cryptoKaijusTokenService = require('../../services/cryptoKaijusToken.service');

const token = require('express').Router({mergeParams: true});

token.get('/id/:tokenId', async (req, res, next) => {
    try {
        const tokenId = req.params.tokenId;
        const network = req.params.network;

        const details = await cryptoKaijusTokenService.getTokenDetails(network, tokenId);

        return res.status(200).json(details);
    } catch (e) {
        next(e);
    }
});

token.get('/nfc/:nfcId', async (req, res, next) => {
    try {
        const nfcId = req.params.nfcId;
        const network = req.params.network;

        const details = await cryptoKaijusTokenService.getNfcDetails(network, nfcId);

        return res.status(200).json(details);
    } catch (e) {
        next(e);
    }
});

token.get('/account/:address', async (req, res, next) => {
    try {
        const address = req.params.address;
        const network = req.params.network;

        const tokensOf = await cryptoKaijusTokenService.tokensOf(network, address);

        return res.status(200).json(tokensOf);
    } catch (e) {
        next(e);
    }
});

token.get('/all', async (req, res, next) => {
    try {
        const network = req.params.network;

        const allKaijus = await cryptoKaijusTokenService.getAllTokens(network);

        return res.status(200).json(allKaijus);
    } catch (e) {
        next(e);
    }
});

token.get('/traits', async (req, res, next) => {
    try {
        const network = req.params.network;

        const allKaijus = await cryptoKaijusTokenService.getAllTokens(network);

        return res
            .status(200)
            .set('Cache-Control', 'public, max-age=86400')
            .json({
                colourStats: _.chain(allKaijus).filter((k) => k).map((k) => k.ipfsData.attributes.colour).countBy().value(),
                classStats: _.chain(allKaijus).filter((k) => k).map((k) => k.ipfsData.attributes.class).countBy().value(),
                genderStats: _.chain(allKaijus).filter((k) => k).map((k) => k.ipfsData.attributes.gender).countBy().value(),
                skillStats: _.chain(allKaijus).filter((k) => k).map((k) => k.ipfsData.attributes.skill).countBy().value()
            });
    } catch (e) {
        next(e);
    }
});

module.exports = token;
