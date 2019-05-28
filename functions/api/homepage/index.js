const _ = require('lodash');

const cryptoKaijusTokenService = require('../../services/cryptoKaijusToken.service');

const homepage = require('express').Router({mergeParams: true});

homepage.get('/', async (req, res, next) => {
    try {
        const network = req.params.network;

        // 3 by 3 rows on the front page to show a selection
        const selectedKaijuTokenIds = [
            0, 1, 256,
            127, 209, 218,
            233, 262, 173
        ];

        const selectedKaiju = await Promise.all(
            selectedKaijuTokenIds.map((tokenId) => {
                return cryptoKaijusTokenService.getTokenDetails(network, tokenId);
            }));

        const totalSupply = await cryptoKaijusTokenService.getTokenTotals(network);

        return res.status(200).json({
            totalSupply: totalSupply,
            selectedKaiju: selectedKaiju
        });
    } catch (e) {
        next(e);
    }
});

module.exports = homepage;
