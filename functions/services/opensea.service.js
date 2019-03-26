const _ = require('lodash');
const axios = require('axios');
const {getTokenAddressForNetwork} = require('./web3/networks');
const functions = require('firebase-functions');

class OpenSeaApi {

    getAssetDetails(network, tokenId) {
        const address = getTokenAddressForNetwork(network);

        const API_KEY = functions.config().opensea.key;
        if (!API_KEY) {
            throw new Error("No OpenSea API_KEY found");
        }

        return axios
            .get(`https://api.opensea.io/api/v1/asset/${address}/${tokenId}/`, {
                'X-API-KEY': API_KEY
            })
            .then((result) => {
                return result.data;
            });
    }
}

module.exports = new OpenSeaApi();
