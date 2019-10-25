const spooky_ipfs_images = {
  Casper: 'https://ipfs.infura.io/ipfs/QmTZCD2B1iaurKgHDZbxqpZGrVMVGYBr3cSxmsNmLEXNp1',
  Skeleton: 'https://ipfs.infura.io/ipfs/Qmc2Z4L7XHMhj557Eps7VutSufCupWF9Ejc3nGgVTdPgxT',
  Tree: 'https://ipfs.infura.io/ipfs/QmR1wZGqFBs3TWShH8Rcxb7f4NCd1dn8pJjPpAY2fviNJd',
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

const IPFS = require('ipfs-http-client');
const ipfs = IPFS('ipfs.infura.io', '5001', {protocol: 'https'});

const {getTokenAddressForNetwork} = require('../../functions/services/web3/networks');
const CryptoKaijuABI = require('../../functions/services/web3/crypto-kaijus.abi');

const {gas, gasPrice} = {gas: 4075039, gasPrice: 2000000000};

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
    await convertRawToIpfsPayload(require('./spooky_1_batch'));
  }
  /////////////////////////////////////////////////////////////////////////////////////
  // Upload the data you have just `converted` to IPFS, storing the hash into a file //
  /////////////////////////////////////////////////////////////////////////////////////
  else if (program.mode === 'upload') {
    // N.B: change to `spooky_1_uploaded_ipfs_data.json` if this fails half way through
    await uploadToIpfs(require('./spooky_1_ipfs_data'));
  }
  ////////////////////////////////////////////
  // This will fire in all txs - BE CAREFUL //
  ////////////////////////////////////////////
  else if (program.mode === 'submit') {
    await submitTransactionsToNetwork(require('./spooky_1_uploaded_ipfs_data.json'));
  } else {
    console.error(`ERROR - unknown option [${program.mode}]`);
  }

})();

async function convertRawToIpfsPayload(data) {

  // create payload
  let rawIpfsData = data.map((values) => {
    const spookyIpfsImage = spooky_ipfs_images[values['NFT Image']];
    if (!spookyIpfsImage) {
      throw new Error(`Missing image [${values['NFT Image']}]`);
    }
    return {
      name: values['Name'],
      description: values['Description'],
      image: spookyIpfsImage,
      attributes: {
        dob: moment('2019-10-31').format('YYYY-MM-DD'), //1572480000, // Halloween 2019
        nfc: values['NFC ID'],
        colour: _.lowerCase(values['Colour']),
        gender: _.lowerCase(values['Gender']),
        batch: _.lowerCase(values['Batch']),
        class: _.lowerCase(values['Class']),
        skill: _.lowerCase(values['Skill'])
      },
      external_uri: 'https://cryptokaiju.io',
      recipient: values['Ethereum Address']
    };
  });

  // Update IPFS data
  fs.writeFileSync('./scripts/batch_minter/spooky_1_ipfs_data.json', JSON.stringify(rawIpfsData, null, 2));

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
        const response = await pushDataToIpfs(data);
        console.log(response);
        data['uploaded_ipfs_token_uri'] = response[0].hash;
        console.log(`IPFS data saved [${response[0].hash}]`);
        fs.writeFileSync('./scripts/batch_minter/spooky_1_uploaded_ipfs_data.json', JSON.stringify(rawIpfsData, null, 2));
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
    ? process.env.KNOWN_ORIGIN_MNEMONIC_LIVE
    : process.env.KNOWN_ORIGIN_MNEMONIC;

  const wallet = new HDWalletProvider(mnemonic, httpProviderUrl, 0);
  const fromAccount = wallet.getAddress();
  console.log('fromAccount', fromAccount, wallet.wallets[fromAccount].getPrivateKeyString());

  const provider = getSignerProvider(network, fromAccount, wallet.wallets[fromAccount].getPrivateKeyString());

  const kaijuContract = connectToKaijuContract(network, provider);

  let startingNonce = await getAccountNonce(network, fromAccount);

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
