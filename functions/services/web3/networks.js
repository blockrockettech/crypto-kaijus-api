const _ = require('lodash');
const Eth = require('ethjs');

const {INFURA_KEY} = require('../constants');

function getHttpProviderUri(network) {
    if (_.toNumber(network) === 5777) {
        return 'http://127.0.0.1:7545'; // a.k.a. truffle
    }
    return `https://${getNetwork(network)}.infura.io/v3/${INFURA_KEY}`;
}

const networkSplitter = (network, {ropsten, rinkeby, mainnet, local}) => {
    switch (network) {
        case 1:
        case '1':
        case 'mainnet':
            return mainnet;
        case 3:
        case '3':
        case 'ropsten':
            return ropsten;
        case 4:
        case '4':
        case 'rinkeby':
            return rinkeby;
        case 5777:
        case '5777':
        case 'local':
            // This may change if a clean deploy
            return local;
        default:
            throw new Error(`Unknown network ID ${network}`);
    }
};

const getNetwork = (network) => {
    return networkSplitter(network, {
        mainnet: 'mainnet',
        ropsten: 'ropsten',
        rinkeby: 'rinkeby',
        local: 'local'
    });
};

const getTokenAddressForNetwork = (network) => {
    return networkSplitter(network, {
        mainnet: '0x102C527714AB7e652630cAc7a30Abb482B041Fd0',
        ropsten: '0x00d539C0570A809a56F8E65c7291Efe80d1Ec57B',
        rinkeby: '0xACec66D7445ee59e70089C1DCe206833A6d0d3CC',
        local: '0x194bAfbf8eb2096e63C5d9296363d6DAcdb32527'
    });
};

const connectToToken = (network) => {
    return new Eth(new Eth.HttpProvider(getHttpProviderUri(network)))
        .contract(require('./crypto-kaijus.abi'))
        .at(getTokenAddressForNetwork(network));
};

const ethjsProvider = (network) => {
    return new Eth(new Eth.HttpProvider(getHttpProviderUri(network)));
};

module.exports = {
    ethjsProvider,
    connectToToken
};
