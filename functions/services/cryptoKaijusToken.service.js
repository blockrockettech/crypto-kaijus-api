const _ = require('lodash');
const Eth = require('ethjs');
const axios = require('axios');

const {connectToToken} = require('../services/web3/networks');

class CryptoKaijusTokenService {

    async getTokenDetails(network, tokenId) {
        const contract = connectToToken(network);
        const results = await this.tokenDetails(contract, tokenId);
        const owner = await this.ownerOf(contract, tokenId);
        return this.mapTokenDetails(results, owner);
    }

    async getNfcDetails(network, nfcId) {
        const contract = connectToToken(network);
        const results = await this.nfcDetails(contract, nfcId);
        const owner = await this.ownerOf(contract, results.tokenId);
        return this.mapTokenDetails(results, owner);
    }

    async tokensOf(network, account) {
        const contract = connectToToken(network);

        const {_tokenIds} = await contract.tokensOf(account);
        const accountKaijus = _.map(_tokenIds, async (tokenId) => {
            const results = await this.tokenDetails(contract, tokenId);
            const owner = await this.ownerOf(contract, tokenId);
            return this.mapTokenDetails(results, owner);
        });

        return Promise.all(accountKaijus);
    }

    async getAllTokens(network) {
        const contract = connectToToken(network);

        const tokenPointer = await this.tokenIdPointer(contract, network);

        const allKaijus = _.map(_.range(tokenPointer), async (tokenId) => {
            const results = await this.tokenDetails(contract, tokenId);
            const owner = await this.ownerOf(contract, tokenId);
            return this.mapTokenDetails(results, owner);
        });

        const results = await Promise.all(allKaijus);
        return _.filter(results, (result) => result);
    }

    ////////////
    // Mapper //
    ////////////

    async mapTokenDetails(results, owner) {
        if (!results.tokenUri) {
            return undefined;
        }

        let data = {
            ...results,
            owner
        };
        data.ipfsData = (await axios.get(data.tokenUri)).data;
        return data;
    }

    ///////////////
    // Raw calls //
    ///////////////

    async tokenIdPointer(contract, network) {
        return contract.tokenIdPointer()
            .then((results) => results[0].toNumber());
    }

    async ownerOf(contract, tokenId) {
        return contract.ownerOf(tokenId)
            .then((results) => results[0]);
    }

    async tokenDetails(contract, tokenId) {
        return contract.tokenDetails(tokenId)
            .then(({tokenId, nfcId, tokenUri, dob}) => {
                return {
                    tokenId: tokenId.toNumber(),
                    nfcId: Eth.toAscii(nfcId).replace(/\0/g, ''),
                    tokenUri: tokenUri,
                    dob: this.handleDodgyNumber(dob)
                };
            });
    }

    handleDodgyNumber(dob) {
        try {
            return dob.toNumber();
        } catch (e) {
            return 0;
        }
    }

    async nfcDetails(contract, nfcId) {
        return contract.nfcDetails(Eth.fromAscii(nfcId))
            .then(({tokenId, nfcId, tokenUri, dob}) => {
                return {
                    tokenId: tokenId.toNumber(),
                    nfcId: Eth.toAscii(nfcId).replace(/\0/g, ''),
                    tokenUri: tokenUri,
                    dob: dob.toNumber()
                };
            });
    }
}

module.exports = new CryptoKaijusTokenService();
