const doge_ipfs_images = {
  'Gold Fuji Animation': 'QmXETquoqUCeN5vyUvtmzPmSKKPVbJy2NQDKRfjABVVQUn',
  'Gold Fuji Night': `QmPpoo7AKtrDXxGfiD7vh2K1JwzouevbDLWkf55afHGsXm`,
  'Gold Fuji': `QmX6iz6r16LCLwbV9qebSqFaH3aQ5UXNo5XryXwkhMNGyM`,
  'Gold Paris Night': `QmYs6h8PkSWR9rQEbUCZDbtEmhzXafCeXjpL3pmkrHfdSA`,
  'Gold Paris': `QmfL6iwP2PwE8YNqzASRYQTWnN54wXeJ3ousVhPpWBvpGX`,
  'Gold Paris Holographic': `Qmc7VYYVMAoTdoBEDsfDfXFZsZXWxjVDkuU8nLWtKYz4Vr`,
  'Gold London': `QmY4SB5qpdNu2gzvdFoaP77h9Dit3pRVuq5D4CPPvZgDuA`,
  'Gold Fuji Space Candy': `Qmea53Cw9DWHFYAG2SJ4Q13YQ6yccfhstcoaY4Ue1HANiE`,
  'Red Fuji': `QmTBbUnUXu5fDQXV6aQJp3QyMg6DsnsHRuRTio32iW3eUB`,
  'Red Fuji Tangerine Dream': `QmXcTt3mMnE1rcoV649fNuNAwME7tFdMMnV1SHAe3eMFMY`,
  'Red Paris Night': `QmbjqpUK3PoFap6hxTekToKkrKb7XQHD1FG2iJZBia4cDW`,
  'Red Paris': 'QmaQvZji4gQdYtjdTomATAjhj1pzEJBYaAZYEZYZ123LmB'
};

const fs = require('fs');
const _ = require('lodash');
const Eth = require('ethjs');
const sign = require('ethjs-signer').sign;
const SignerProvider = require('ethjs-provider-signer');
const getChecksumAddress = require('ethjs-account').getChecksumAddress;
const moment = require('moment');
const program = require('commander');
const HDWalletProvider = require('truffle-hdwallet-provider');
const promiseRetry = require('promise-retry');

const IPFS = require('ipfs-http-client');
const ipfs = IPFS('ipfs.infura.io', '5001', {protocol: 'https'});

const {getTokenAddressForNetwork} = require('../../../functions/services/web3/networks');
const CryptoKaijuABI = require('../../../functions/services/web3/crypto-kaijus.abi');

const {gas, gasPrice} = {gas: 3075039, gasPrice: 30000000000};

const FOLDER_NAME = 'doge_batch_2';

console.log(`gas=${gas} | gasPrice=${gasPrice}`);

(async function () {

  program
    .option('-n, --network <n>', 'Network - either mainnet,ropsten,rinkeby,local')
    .option('-m, --mode <n>', 'Mode - either convert,upload,submit')
    .parse(process.argv);


  if (!program.network) {
    console.log(`Please specify -n mainnet,ropsten,rinkeby`);
    process.exit();
  }

  if (!program.mode) {
    console.log(`Please specify -m mode e.g. upload`);
    process.exit();
  }

  /////////////////////////////////////////////////////////
  // Convert the raw CSV data into JSON ready for upload //
  /////////////////////////////////////////////////////////
  if (program.mode === 'convert') {
    await convertRawToIpfsPayload(require('./batch'));
  }
    /////////////////////////////////////////////////////////////////////////////////////
    // Upload the data you have just `converted` to IPFS, storing the hash into a file //
  /////////////////////////////////////////////////////////////////////////////////////
  else if (program.mode === 'upload') {
    // N.B: change to `spooky_uploaded_ipfs_data.json` if this fails half way through
    await uploadToIpfs(require('./ipfs_data.json'));
  }
    ////////////////////////////////////////////
    // This will fire in all txs - BE CAREFUL //
  ////////////////////////////////////////////
  else if (program.mode === 'submit') {
    await submitTransactionsToNetwork(require('./uploaded_ipfs_data.json'));
  } else {
    console.error(`ERROR - unknown option [${program.mode}]`);
  }

})();

async function convertRawToIpfsPayload(data) {

  // create payload
  let rawIpfsData = data.map((values) => {
    const ipfsImage = doge_ipfs_images[values['nft image']];
    if (!ipfsImage) {
      throw new Error(`Missing image [${values['nft image']}]`);
    }
    return {
      name: values['name'],
      description: values['description'],
      image: `https://ipfs.infura.io/ipfs/${ipfsImage}`,
      attributes: {
        dob: moment(values['dob'], "DD/MM/YYYY").format('YYYY-MM-DD'),
        nfc: values['nfc'],
        colour: _.lowerCase(values['colour']),
        gender: _.lowerCase(values['gender']),
        batch: _.lowerCase(values['batch']),
        class: _.lowerCase(values['class']),
        skill: _.lowerCase(values['skill'])
      },
      external_uri: 'https://cryptokaiju.io',
      recipient: values['recipient']
    };
  });

  // Update IPFS data
  fs.writeFileSync(`./scripts/batch_minter/${FOLDER_NAME}/ipfs_data.json`, JSON.stringify(rawIpfsData, null, 2));

  return rawIpfsData;
}

async function uploadToIpfs(rawIpfsData) {

  async function pushDataToIpfs(ipfsData) {
    console.log('Pushing data to IPFS');
    const ipfsDataWithoutRecipient = _.omit(ipfsData, 'recipient');
    let buffer = Buffer.from(JSON.stringify(ipfsDataWithoutRecipient));
    return ipfs.add(buffer, {pin: true})
      .catch((error) => {
        console.log(error);
        throw error;
      });
  }

  async function loadData() {
    for (let data of rawIpfsData) {
      if (!data['uploaded_ipfs_token_uri']) {
        // const response = await pushDataToIpfs(data);
        const response = await  promiseRetry(function (retry, number) {
            console.log('attempt number', number);
            return pushDataToIpfs(data)
              .catch(retry);
          });
        console.log(response);
        data['uploaded_ipfs_token_uri'] = response[0].hash;
        console.log(`IPFS data saved [${response[0].hash}]`);
        fs.writeFileSync(`./scripts/batch_minter/${FOLDER_NAME}/uploaded_ipfs_data.json`, JSON.stringify(rawIpfsData, null, 2));
      } else {
        console.log(`Skipping IPFS upload - found [${data['uploaded_ipfs_token_uri']}]`);
      }
    }
  }

  await loadData();
}

async function submitTransactionsToNetwork(ipfsData) {

  const network = program.network;
  const httpProviderUrl = getHttpProviderUri(network);

  const mnemonic = network === 'mainnet'
    ? process.env.CRYPTO_KAIJU_MINTER
    : process.env.PROTOTYPE_BR_KEY;

  const wallet = new HDWalletProvider(mnemonic, httpProviderUrl, 0);
  const fromAccount = wallet.getAddress();
  console.log('fromAccount', fromAccount, wallet.wallets[fromAccount].getPrivateKeyString());

  const provider = getSignerProvider(network, fromAccount, wallet.wallets[fromAccount].getPrivateKeyString());
  // console.log('provider', provider);

  const kaijuContract = connectToKaijuContract(network, provider);
  // console.log('kaijuContract', kaijuContract);

  let startingNonce = await getAccountNonce(network, fromAccount);
  console.log('staringNonce', startingNonce);

  const txs = _.map(ipfsData, (data) => {
    const {uploaded_ipfs_token_uri, attributes, recipient} = data;
    const {dob, nfc} = attributes;
    console.log(recipient, nfc, uploaded_ipfs_token_uri, moment(dob).unix());
    return kaijuContract.mintTo(getChecksumAddress(recipient), Eth.fromAscii(nfc), uploaded_ipfs_token_uri, moment(dob).unix(),
      {
        from: fromAccount,
        nonce: startingNonce++,
        gas: gas,
        gasPrice: gasPrice
      });
  });

  Promise
    .all(txs)
    .then((rawTransactions) => {

      console.log(`
            Submitted transactions
              Transactions Submitted  
                    - Total [${rawTransactions.length}]
            `);
      console.log(rawTransactions);
      process.exit();
    });


}

async function getAccountNonce(network, account) {
  return new Eth(new Eth.HttpProvider(getHttpProviderUri(network)))
    .getTransactionCount(account);
}

function connectToKaijuContract(network, provider) {
  return new Eth(provider)
    .contract(CryptoKaijuABI)
    .at(getTokenAddressForNetwork(network));
}

function getHttpProviderUri(network) {
  if (network === 'local') {
    return 'HTTP://127.0.0.1:7545';
  }
  return `https://${network}.infura.io/v3/${process.env.PROTOTYPE_BR_INFURA_KEY}`;
}

function getSignerProvider(network, fromAccount, privateKey) {
  if (network === 'local') {
    return new SignerProvider(`HTTP://127.0.0.1:7545`, {
      signTransaction: (rawTx, cb) => cb(null, sign(rawTx, privateKey)),
      accounts: (cb) => cb(null, [fromAccount]),
    });
  }

  return new SignerProvider(`https://${network}.infura.io/v3/${process.env.PROTOTYPE_BR_INFURA_KEY}`, {
    signTransaction: (rawTx, cb) => cb(null, sign(rawTx, privateKey)),
    accounts: (cb) => cb(null, [fromAccount]),
  });
}
