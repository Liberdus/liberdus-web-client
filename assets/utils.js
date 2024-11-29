/* eslint-disable no-console */
import * as crypto from '@shardus/crypto-web'
import axios from 'axios'
import stringify from 'fast-stable-stringify'
import { ethers } from 'ethers'
import { Ratchet, getPublicKey, secpUtils } from '@thant-dev/ciphersuite'

// eslint-disable-next-line no-unused-vars
import { map, filter, sort, sortBy, orderBy, flow, concat, keys, get } from 'lodash'
import config from '../config'
import {
  TX_RECEIPT_APPLIED,
  TX_RECEIPT_REJECTED,
  TX_RECEIPT_NOT_FOUND,
  TX_RECEIPT_ERROR
} from '../constants/tx'

let host
const defaultSeedNode = `${config.server.ip}:${config.server.port}`
// eslint-disable-next-line no-undef
const storedSeedNode = localStorage.getItem('seednode')
const seedNodeHost = storedSeedNode || defaultSeedNode
const utils = {}
const walletEntries = {}
const network = '0'.repeat(64)
const verboseLogs = false

utils.init = async defaultHost => {
  host = defaultHost
  crypto.initialize('69fa4195670576c0160d660c3be36556ff8d504725be8a59b5a96509e0c994bc')
  console.log('crypto initialized')
  // crypto.setCustomStringifier(Utils.safeStringify, 'shardus_safeStringify')
  const sampleHash = crypto.hash('Hello World')
  return sampleHash
}

utils.getCurrentSeedNode = function (host) {
  return {
    ip: host.split(':')[0],
    port: parseInt(host.split(':')[1])
  }
}

utils.hashVerificationCode = code => {
  return crypto.hash(code)
}

utils.updateHost = newHost => {
  host = newHost
  return true
}

utils.isServerActive = async () => {
  try {
    const res = await axios.get(utils.getProxyUrl('/network/parameters'))
    const isActive = !!(res.status === 200)
    return isActive
  } catch (e) {
    return false
  }
}

utils.getProxyUrl = function (url, option) {
  try {
    let ip, port
    if (!option) {
      ip = host.split(':')[0]
      port = host.split(':')[1]
    } else if (option) {
      ip = option.ip
      port = option.port
    }
    if (verboseLogs) {
      console.log('getProxyUrl', url, option, ip, port)
      console.log(ip, port)
    }
    if (ip === 'localhost' || ip === '127.0.0.1') {
      return `http://localhost:${port}${url}`
    }

    if (ip.includes('192.168.1')) {
      return `http://${ip}:${port}${url}`
    }
    return `https://${config.proxy.ip}:${config.proxy.port}/rproxy/${ip}:${port}${url}`
  } catch (e) {
    return ''
  }
}

utils.getProxyUrlWithRandomHost = async function (url, option) {
  const randomHost = await this.getRandomHost()
  const { ip, port } = randomHost
  if (ip === 'localhost' || ip === '127.0.0.1') {
    return `http://localhost:${port}${url}`
  }
  if (ip.includes('192.168.1')) {
    return `http://${ip}:${port}${url}`
  }
  return `https://${config.proxy.ip}:${config.proxy.port}/rproxy/${ip}:${port}${url}`
}

utils.getRandomHost = async () => {
  const ip = seedNodeHost.split(':')[0]
  const port = seedNodeHost.split(':')[1]
  const res = await axios.get(utils.getProxyUrl('/nodelist', { ip, port }), {
    timeout: 10000
  })
  const nodeList = res.data.nodeList
  const randIndex = Math.floor(Math.random() * nodeList.length)
  const randHost = nodeList[randIndex]
  if (!randHost) {
    throw new Error('Unable to get random host')
  }
  if (randHost.ip === '127.0.0.1' || randHost.ip === 'localhost') {
    randHost.ip = seedNodeHost.split(':')[0]
  }
  return randHost
}

utils.updateSeedNodeHostLocally = async (ip, port) => {
  const seedNodeHost = `${ip}:${port}`
  // eslint-disable-next-line no-undef
  localStorage.setItem('seednode', seedNodeHost)
}

utils.isSeedNodeOnline = async (ip, port) => {
  try {
    // const seedNodeHost = `${ip}:${port}`
    const res = await axios.get(utils.getProxyUrl('/nodelist', { ip, port }), {
      timeout: 10000
    })
    if (res.status === 200) {
      return true
    }
    return false
  } catch (e) {
    console.warn(e)
    return false
  }
}

utils.getSeedNode = async (ip, port) => {
  return {
    ip: seedNodeHost.split(':')[0],
    port: seedNodeHost.split(':')[1]
  }
}

utils.bytesToHex = uint8Array => {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

utils.createAccount = () => {
  let keys = {
    address: '',
    keys: {
      publicKey: '',
      privateKey: ''
    }
  }
  if (config.useEthereumAddress) {
    // const newAccount = ethers.Wallet.createRandom()
    // keys.address = toShardusAddress(newAccount.address)
    // keys.keys.publicKey = keys.address
    // keys.keys.privateKey = newAccount.privateKey

    // Generate the key pair using @noble/secp256k1
    const privateKey = secpUtils.randomPrivateKey()

    // Derive Ethereum address if needed
    const uncompressedPublicKey = getPublicKey(privateKey, false); // false indicates uncompressed
    const uncompressedPublicKeyHex = ethers.utils.hexlify(uncompressedPublicKey);
    console.log('uncompressedPublicKeyHex', uncompressedPublicKeyHex)
    const ethAddress = ethers.utils.computeAddress(uncompressedPublicKeyHex)

    keys.address = toShardusAddress(ethAddress)
    keys.keys.publicKey = uncompressedPublicKey
    keys.keys.privateKey = privateKey
    console.log('keys', keys)
  } else {
    const newAccount = crypto.generateKeys()
    keys.address = newAccount.publicKey
    keys.keys.publicKey = newAccount.publicKey
    keys.keys.privateKey = newAccount.privateKey
  }
  console.log('keys', keys)
  return keys
}


const toShardusAddress = (addressStr) => {
  //  change this: 0x665eab3be2472e83e3100b4233952a16eed20c76
  //  to this: 665eab3be2472e83e3100b4233952a16eed20c76000000000000000000000000
  return addressStr.slice(2).toLowerCase() + '0'.repeat(24)
}

const signObj = async (tx, source) => {
  if (config.useEthereumAddress) {
    await signEthereumTx(tx, source)
  } else {
    const keys = source.keys
    crypto.signObj(tx, keys.privateKey, keys.publicKey)
  }
}

const signEthereumTx = async (tx, source) => {
  console.log(`signEthereumTx`, source)
  if (source == null || source.keys == null) {
    throw new Error('Keys are required for signing')
  }

  const keys = source.keys

  // Create a copy of the tx without any existing sign field
  const dataToSign = Object.assign({}, tx)
  delete dataToSign.sign

  // Convert the object to a string with BigInt support
  const message = crypto.hashObj(dataToSign)

  try {
    // Create wallet from private key
    const wallet = new ethers.Wallet(keys.privateKey)

    // Sign the message
    const signature = await wallet.signMessage(message)

    // Add signature to transaction
    tx.sign = {
      owner: source.address,
      sig: signature
    }
  } catch (error) {
    throw new Error(`Failed to sign transaction: ${error.message}`)
  }
}

utils.saveWallet = newWalletEntry => {
  console.log('\n\n saveWallet \n\n', newWalletEntry)
  try {
    // eslint-disable-next-line no-undef
    const existingWalletList = crypto.safeJsonParse(localStorage.getItem('wallets'))
    let newWallet = (existingWalletList && existingWalletList.length > 0) ? [...existingWalletList] : []
    newWallet = newWallet.filter(w => w.handle !== newWalletEntry.handle)
    newWallet = newWallet.concat(newWalletEntry)
    // .filter(w => w.handle !== newWalletEntry.handle)
    // .concat(newWalletEntry)
    // eslint-disable-next-line no-undef
    localStorage.setItem('wallets', crypto.safeStringify(newWallet))
  } catch (e) {
    console.log(e)
    // eslint-disable-next-line no-undef
    localStorage.setItem('wallets', crypto.safeStringify([newWalletEntry]))
  }
}

utils.loadWallet = username => {
  try {
    // eslint-disable-next-line no-undef
    const loadedEntries = localStorage.getItem('wallets')
    const walletList = crypto.safeJsonParse(loadedEntries)
    return walletList.find(w => w.handle === username)
  } catch (e) {
    return null
  }
}

utils.loadLastMessage = username => {
  try {
    // eslint-disable-next-line no-undef
    const loadedEntries = localStorage.getItem('lastMessage')
    const lastMessage = crypto.safeJsonParse(loadedEntries)
    return lastMessage[username]
  } catch (e) {
    return null
  }
}

utils.loadLastTx = username => {
  try {
    // eslint-disable-next-line no-undef
    const loadedEntries = localStorage.getItem('lastTx')
    const lastTx = crypto.safeJsonParse(loadedEntries)
    return lastTx[username]
  } catch (e) {
    return null
  }
}

utils.createAccountAndStoreInWallet = (name, id) => {
  console.log('createAccountAndStoreInWallet', name, id)
  const account = utils.createAccount()
  console.log('account', account)
  if (typeof id === 'undefined' || id === null) {
    id = crypto.hash(name)
  }
  account.id = id
  console.log('account', account)
  return account
}

function getInjectUrl() {
  return utils.getProxyUrl('/inject')
}

function getAccountsUrl() {
  return utils.getProxyUrl('/accounts')
}

function getAccountUrl(id) {
  return utils.getProxyUrl(`/account/${id}`)
}

async function getJSON(url) {
  try {
    const response = await axios(url)
    if (response.data) {
      return crypto.safeJsonParse(crypto.safeStringify(response.data))
    }
  } catch (err) {
    console.log(err)
    return err
  }
}

async function postJSON(url, obj) {
  const response = await axios.post(url, obj)
  return response.data
}

async function injectTx(tx) {
  try {
    console.log(tx)
    const data = crypto.safeStringify(tx)
    console.log(data.sign || tx.sign)
    const url = getInjectUrl()
    console.log('url', url)
    const res = await postJSON(url, { tx: data })
    console.log(res)
    return res
  } catch (err) {
    console.warn(err)
    return err.message
  }
}

utils.getTxStatus = async (url, tx) => {
  try {
    delete tx.txId

    const txData = convert(tx)
    const res = await postJSON(`${url}/api/tx/status`, txData)
    console.warn(res)

    if (res.success) {
      const appliedHash = crypto.hashObj({ tx: tx, status: 'applied', netId: '123abc' });
      const rejectedHash = crypto.hashObj({ tx: tx, status: 'rejected', netId: '123abc' });

      console.log('\n\n === hash result: \n\n', appliedHash, rejectedHash)

      if (appliedHash.toString().substring(0, 8) === res.result[0]) {
        // Transaction was applied
        return {
          status: TX_RECEIPT_APPLIED,
          message: 'Applied'
        }

      } else {
        // Transaction was rejected
        return {
          status: TX_RECEIPT_REJECTED,
          message: 'Rejected'
        }
      }
    } else {
      return {
        status: TX_RECEIPT_NOT_FOUND,
        message: res.result
      }
    }
  } catch (err) {
    console.warn(err)
    return {
      status: TX_RECEIPT_ERROR,
      message: 'Unexpected error occured while checking the transaction.'
    }
  }
}

function convert(tx) {
  const orig = crypto.safeJsonParse(crypto.safeStringify(tx))
  const txid = crypto.hashObj(orig, true)
  const addresses = getKeyFromTransaction(orig)
  const address = getClosestAddress(txid, addresses)
  const timestamp = orig.timestamp

  return {
    txid,
    address,
    timestamp
  }
}

function getClosestAddress(txid, addresses) {
  const distances = addresses.map(addr =>
    Math.abs(parseInt(txid.slice(0, 5), 16) - parseInt(addr.slice(0, 5), 16))
  );
  const smallestDistance = distances.indexOf(Math.min(...distances));
  return addresses[smallestDistance];
};

function getKeyFromTransaction(tx) {
  const result = {
    sourceKeys: [],
    targetKeys: [],
    allKeys: [],
    timestamp: tx.timestamp,
  };
  switch (tx.type) {
    case 'init_network':
      // result.sourceKeys = [tx.from]
      result.targetKeys = [tx.network];
      break;
    case 'snapshot':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.network];
      break;
    case 'email':
      result.sourceKeys = [tx.signedTx.from];
      break;
    case 'gossip_email_hash':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.account];
      break;
    case 'verify':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.network];
      break;
    case 'register':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.aliasHash];
      break;
    case 'create':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.to];
      break;
    case 'transfer':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.to, tx.network];
      break;
    case 'distribute':
      result.sourceKeys = [tx.from];
      result.targetKeys = [...tx.recipients, tx.network];
      break;
    case 'message':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.to, tx.chatId, tx.network];
      break;
    case 'toll':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.network];
      break;
    case 'friend':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.network];
      break;
    case 'remove_friend':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.to, tx.network];
      break;
    case 'node_reward':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.to, tx.network];
      break;
    // case 'stake':
    //   result.sourceKeys = [tx.from];
    //   result.targetKeys = [tx.network];
    //   break;
    // case 'remove_stake':
    //   result.sourceKeys = [tx.from];
    //   result.targetKeys = [tx.network];
    //   break;
    // case 'remove_stake_request':
    //   result.sourceKeys = [tx.from];
    //   result.targetKeys = [tx.network];
    //   break;
    // case 'deposit_stake':
    //   result.sourceKeys = [tx.nominator]; 
    //   result.targetKeys = [tx.nominee];
    //   break;
    // case 'withdraw_stake':
    //   result.sourceKeys = [tx.nominator];
    //   result.targetKeys = [tx.nominee];
    //   break;
    case 'snapshot_claim':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.network];
      break;
    case 'issue':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.issue, tx.proposal, tx.network];
      break;
    case 'dev_issue':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.devIssue, tx.network];
      break;
    case 'proposal':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.issue, tx.proposal, tx.network];
      break;
    case 'dev_proposal':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.devIssue, tx.devProposal, tx.network];
      break;
    case 'vote':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.issue, tx.proposal, tx.network];
      break;
    case 'dev_vote':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.devIssue, tx.devProposal, tx.network];
      break;
    case 'tally':
      result.sourceKeys = [tx.from];
      result.targetKeys = [...tx.proposals, tx.issue, tx.network];
      break;
    case 'apply_tally':
      result.targetKeys = [tx.network];
      break;
    case 'dev_tally':
      result.sourceKeys = [tx.from];
      result.targetKeys = [...tx.devProposals, tx.devIssue, tx.network];
      break;
    case 'apply_dev_tally':
      result.targetKeys = [tx.network];
      break;
    case 'parameters':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.network, tx.issue];
      break;
    case 'apply_parameters':
      result.targetKeys = [tx.network];
      break;
    case 'dev_parameters':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.devIssue, tx.network];
      break;
    case 'apply_dev_parameters':
      result.targetKeys = [tx.network];
      break;
    case 'developer_payment':
      result.sourceKeys = [tx.from];
      result.targetKeys = [tx.developer, tx.network];
      break;
    case 'apply_developer_payment':
      result.targetKeys = [tx.network];
      break;
  }
  result.allKeys = result.allKeys.concat(result.sourceKeys, result.targetKeys);
  return result.allKeys;
};

async function getAccountData(id) {
  try {
    const accountData = await getJSON(
      typeof id !== 'undefined' && id !== null
        ? getAccountUrl(id)
        : getAccountsUrl()
    )
    return accountData
  } catch (err) {
    return err.message
  }
}

async function getToll(friendId, yourId) {
  try {
    const { toll } = await getJSON(
      utils.getProxyUrl(`/account/${friendId}/${yourId}/toll`)
    )
    return toll || BigInt(0)
  } catch (err) {
    return err.message
  }
}

async function getAddress(handle) {
  if (!handle) return
  if (handle.length === 64) return handle
  try {
    for (let i = 0; i < 3; i++) {
      const randomUrl = await utils.getProxyUrlWithRandomHost(`/address/${crypto.hash(handle)}`)
      const data = await getJSON(randomUrl)
      const { address, error } = data
      if (error) {
        console.log(error)
        console.log(`Error while getting address for ${handle}`)
      } else if (address) {
        return address
      }
    }
  } catch (e) {
  }
  return null
}

async function getAccountPublicKey(address) {
  if (!address) return
  try {
    const account = await getAccountData(address)
    console.log(`getAccountPublicKey`, account)
    return account.account.publicKey
  } catch (e) {
    console.log(`Error while getting public key for ${address}`, e.message)
  }
}

async function pollMessages(from, to, timestamp) {
  try {
    const url = utils.getProxyUrl(`/messages/${to}/${from}`)
    const { messages } = await getJSON(url)
    return messages
  } catch (err) {
    return err.message
  }
}

utils.createWallet = (name, id) => {
  if (
    typeof walletEntries[name] !== 'undefined' &&
    walletEntries[name] !== null
  ) {
    console.log(`Wallet named '${name}' already exists.`)
  } else {
    const account = utils.createAccountAndStoreInWallet(name, id)
    console.log(`Created wallet '${name}': '${account.address}'.`)
    return account
  }
}

utils.importWallet = async sk => {
  let entry = {
    address: '',
    keys: {
      publicKey: '',
      secretKey: ''
    }
  }
  if (config.useEthereumAddress) {
    const newAccount = new ethers.Wallet(sk)
    entry.address = toShardusAddress(newAccount.address)
    entry.keys.publicKey = entry.address
    entry.keys.secretKey = sk
  } else {
    entry.address = sk.slice(64)
    entry.keys.publicKey = keys.address
    entry.keys.secretKey = sk
  }
  console.log('entry', entry)
  let handle = await utils.getHandle(entry.address)
  if (handle) {
    entry.id = crypto.hash(handle)
  } else {
    handle = 'Nousername'
  }
  console.log('handle', handle, entry)
  return {
    handle,
    entry
  }
}

utils.listWallet = name => {
  const wallet = walletEntries[name]
  if (typeof wallet !== 'undefined' && wallet !== null) {
    console.log(`${crypto.safeStringify(wallet, null, 2)}`)
  } else {
    console.log(`${crypto.safeStringify(walletEntries, null, 2)}`)
  }
}

utils.registerAlias = async (handle, source) => {
  const tx = {
    type: 'register',
    aliasHash: crypto.hash(handle),
    from: source.address,
    alias: handle,
    publicKey: ethers.utils.hexlify(source.keys.publicKey).slice(2),
    timestamp: Date.now()
  }
  await signObj(tx, source)
  console.log('register tx', tx)
  return new Promise(resolve => {
    injectTx(tx).then(res => {
      console.log(res)
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

utils.addFriend = async (tgt, keys) => {
  console.log(tgt)
  const targetAddress = await getAddress(tgt)
  if (targetAddress === undefined || targetAddress === null) {
    console.log("Target account doesn't exist for: ", tgt)
    return
  }
  const tx = {
    type: 'friend',
    network,
    alias: tgt,
    from: keys.address,
    to: targetAddress,
    amount: BigInt(1),
    timestamp: Date.now()
  }
  await signObj(tx, keys)
  return new Promise(resolve => {
    injectTx(tx).then(res => {
      console.log(res)
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

utils.removeFriend = async (tgt, keys) => {
  const targetAddress = await getAddress(tgt)
  if (targetAddress === undefined || targetAddress === null) {
    console.log("Target account doesn't exist for: ", tgt)
    return
  }
  const tx = {
    type: 'remove_friend',
    network,
    alias: tgt,
    from: keys.address,
    to: targetAddress,
    amount: BigInt(1),
    timestamp: Date.now()
  }
  await signObj(tx, keys)
  return new Promise(resolve => {
    injectTx(tx).then(res => {
      console.log(res)
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

utils.claimTokens = async keys => {
  const tx = {
    type: 'claim_coins',
    network,
    srcAcc: keys.address,
    timestamp: Date.now()
  }
  await signObj(tx, keys)
  return new Promise(resolve => {
    injectTx(tx).then(res => {
      console.log(res)
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

utils.setToll = async (toll, keys) => {
  const tx = {
    type: 'toll',
    network,
    from: keys.address,
    toll: BigInt(toll),
    timestamp: Date.now()
  }
  await signObj(tx, keys)
  console.log(tx)
  return new Promise(resolve => {
    injectTx(tx).then(res => {
      console.log(res)
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

// utils.addStake = (stake, keys) => {
//   const tx = {
//     type: 'stake',
//     network,
//     from: keys.address,
//     stake: stake,
//     timestamp: Date.now()
//   }
//   signObj(tx, keys)
//   console.log(tx)
//   return new Promise(resolve => {
//     injectTx(tx).then(res => {
//       console.log(res)
//       if (res.result.success) {
//         resolve(true)
//       } else {
//         resolve(false)
//       }
//     })
//   })
// }

// utils.removeStake = (stake, keys) => {
//   const tx = {
//     type: 'remove_stake',
//     network,
//     from: keys.address,
//     stake: stake,
//     timestamp: Date.now()
//   }
//   signObj(tx, keys)
//   console.log(tx)
//   return new Promise(resolve => {
//     injectTx(tx).then(res => {
//       console.log(res)
//       if (res.result.success) {
//         resolve(true)
//       } else {
//         resolve(false)
//       }
//     })
//   })
// }

// utils.requestRemoveStake = (stake, keys) => {
//   const tx = {
//     type: 'remove_stake_request',
//     network,
//     from: keys.address,
//     stake: stake,
//     timestamp: Date.now()
//   }
//   signObj(tx, keys)
//   console.log(tx)
//   return new Promise(resolve => {
//     injectTx(tx).then(res => {
//       console.log(res)
//       if (res.result.success) {
//         resolve(true)
//       } else {
//         resolve(false)
//       }
//     })
//   })
// }

utils.depositStake = async (nominee, stake, keys) => {
  console.log(keys)
  const tx = {
    type: 'deposit_stake',
    nominator: keys.address,
    nominee,
    stake: BigInt(stake),
    timestamp: Date.now()
  }
  console.log(tx)
  await signObj(tx, keys)
  return new Promise(resolve => {
    injectTx(tx).then(res => {
      console.log(res)
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

utils.withdrawStake = async (nominee, force, keys) => {
  const tx = {
    type: 'withdraw_stake',
    nominator: keys.address,
    nominee,
    force,
    timestamp: Date.now()
  }
  await signObj(tx, keys)
  console.log(tx)
  return new Promise(resolve => {
    injectTx(tx).then(res => {
      console.log(res)
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

utils.hashMessage = message => {
  if (typeof message !== 'object') {
    console.log('Message must be an object')
    return
  }
  return crypto.hashObj(message)
}

utils.sendMessage = async (payload, sourceAcc, targetHandle) => {
  const source = sourceAcc.entry
  const targetAddress = await getAddress(targetHandle)
  if (targetAddress === undefined || targetAddress === null) {
    console.log("Target account doesn't exist for: ", targetHandle)
    return
  }
  const tollAmount = await getToll(targetAddress, source.address)
  const messageTimestamp = Date.now()
  const stringifiedPayload = crypto.safeStringify(payload)
  const tx = {
    type: 'message',
    network,
    from: source.address,
    to: targetAddress,
    chatId: crypto.hash([source.address, targetAddress].sort().join``),
    message: stringifiedPayload,
    amount: tollAmount,
    timestamp: messageTimestamp
  }
  console.log(`unsigned tx`, tx, source.keys)
  await signObj(tx, source)
  console.log(`signed message`, tx)
  console.log(`signed message`, crypto.safeStringify(tx))
  return new Promise(resolve => {
    injectTx(tx).then(res => {
      console.log(res)
      if (res.result.success === true) resolve({ success: true, pendingTx: tx })
      else resolve({ success: false, pendingTx: null })
    })

  })
}

utils.broadcastMessage = async (text, sourceAcc, recipients) => {
  const source = walletEntries[sourceAcc]
  const targetAccs = []
  const messages = []
  let requiredAmount = BigInt(0)
  for (let i = 0; i < recipients.length; i++) {
    console.log('RECIP: ', recipients[i])
    const tgtAddress = await getAddress(recipients[i])
    targetAccs.push(tgtAddress)
    const message = stringify({
      body: text,
      timestamp: Date.now(),
      handle: source
    })
    // const encryptedMsg = crypto.encrypt(
    //   message,
    //   crypto.convertSkToCurve(source.keys.privateKey),
    //   crypto.convertPkToCurve(tgtAddress)
    // )
    const encryptedMsg = message
    messages.push(encryptedMsg)
    requiredAmount += await getToll(tgtAddress, source.address)
  }
  const tx = {
    type: 'broadcast',
    network,
    messages: messages,
    srcAcc: source.address,
    tgtAccs: targetAccs,
    amount: requiredAmount,
    timestamp: Date.now()
  }
  await signObj(tx, source.keys)
  injectTx(tx).then(res => {
    console.log(res)
  })
}

utils.getHandle = async address => {
  const { handle } = await getJSON(
    utils.getProxyUrl(`/account/${address}/alias`)
  )
  return handle
}

utils.getMessages = async (srcEntry, tgt, timestamp) => {
  const targetAddress = await getAddress(tgt)
  const messages = await pollMessages(
    srcEntry.address,
    targetAddress,
    timestamp
  )
  return messages
}

utils.queryAccount = async handle => {
  let address
  if (handle) address = await getAddress(handle)
  const accountData = await getAccountData(address)
  return accountData
}

utils.queryProposals = async function () {
  const { proposals } = await getJSON(utils.getProxyUrl('/proposals'))
  return proposals
}

utils.queryDevProposals = async function () {
  const { devProposals } = await getJSON(utils.getProxyUrl('/proposals/dev'))
  return devProposals
}

utils.queryLatestProposals = async function () {
  const { proposals } = await getJSON(utils.getProxyUrl('/proposals/latest'))
  return proposals
}

utils.queryLatestDevProposals = async function () {
  const { devProposals } = await getJSON(utils.getProxyUrl('/proposals/dev/latest'))
  return devProposals
}

utils.getProposalCount = async function () {
  const { count } = await getJSON(utils.getProxyUrl('/proposals/count'))
  return count ? count : 0
}

utils.getDevProposalCount = async function () {
  const { count } = await getJSON(utils.getProxyUrl('/proposals/dev/count'))
  return count ? count : 0

}

utils.isTransferTx = tx => tx.type === 'transfer'
utils.isProposalTx = tx => tx.type === 'proposal'
utils.isDevProposalTx = tx => tx.type === 'dev_proposal'
utils.isVoteTx = tx => tx.type === 'vote'
utils.isDevVoteTx = tx => tx.type === 'dev_vote'
utils.isDevPaymentTx = tx => tx.type === 'developer_payment'
utils.isMessageTx = tx => tx.type === 'message'
utils.isRegisterTx = tx => tx.type === 'register'
// utils.isStakeTx = tx => tx.type === 'stake'
// utils.isRemoveStakeTx = tx => tx.type === 'remove_stake'
utils.isDepositStakeTx = tx => tx.type === 'deposit_stake'
utils.isWithdrawStakeTx = tx => tx.type === 'withdraw_stake'
utils.isRewardTx = tx => tx.type === 'node_reward'
utils.isSender = (tx, myAddress) => tx.from === myAddress
utils.getTransferType = (tx, myAddress) =>
  utils.isSender(tx, myAddress) ? 'send' : 'receive'
utils.getMessageType = (tx, myAddress) =>
  utils.isSender(tx, myAddress) ? 'send_message' : 'receive_message'
utils.filterByTxType = (txList, type) => {
  if (type === 'transfer') return filter(txList, utils.isTransferTx)
  else if (type === 'proposal') return filter(txList, utils.isProposalTx)
  else if (type === 'dev_proposal') return filter(txList, utils.isDevProposalTx)
  else if (type === 'vote') return filter(txList, utils.isVoteTx)
  else if (type === 'dev_vote') return filter(txList, utils.isDevVoteTx)
  else if (type === 'developer_payment') return filter(txList, utils.isDevPaymentTx)
  else if (type === 'message') return filter(txList, utils.isMessageTx)
  else if (type === 'register') return filter(txList, utils.isRegisterTx)
  // else if (type === 'stake') return filter(txList, utils.isStakeTx)
  // else if (type === 'remove_stake') return filter(txList, utils.isRemoveStakeTx)
  else if (type === 'deposit_stake') return filter(txList, utils.isDepositStakeTx)
  else if (type === 'withdraw_stake') return filter(txList, utils.isWithdrawStakeTx)
  else if (type === 'node_reward') return filter(txList, utils.isRewardTx)
}

utils.sortByTimestamp = (list, direction) => {
  if (direction === 'desc') {
    return orderBy(list, ['timestamp'], ['desc'])
  } else {
    return orderBy(list, ['timestamp'], ['asc'])
  }
}

function isIosSafari() {
  var ua = window.navigator.userAgent
  var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)
  var webkit = !!ua.match(/WebKit/i)
  var iOSSafari = iOS && webkit && !ua.match(/CriOS/i)
  return iOSSafari
}

utils.queryParameters = async function (component) {
  // console.log(`Calling from ${component}`)
  const { parameters, error } = await getJSON(utils.getProxyUrl('/network/parameters'))
  console.log('parameters', parameters)
  if (error) {
    return error
  } else {
    return parameters
  }
}

utils.queryNodeParameters = async function () {
  const { parameters, error } = await getJSON(utils.getProxyUrl('/network/parameters/node'))
  if (error) {
    return error
  } else {
    return parameters
  }
}

utils.queryIssues = async function () {
  const { issues } = await getJSON(utils.getProxyUrl('/issues'))
  return issues
}

utils.queryDevIssues = async function () {
  const { devIssues } = await getJSON(utils.getProxyUrl('/issues/dev'))
  return devIssues
}

utils.queryLatestIssue = async function () {
  const { issue } = await getJSON(utils.getProxyUrl('/issues/latest'))
  return issue
}

utils.queryLatestDevIssue = async function () {
  const { devIssue } = await getJSON(utils.getProxyUrl('/issues/dev/latest'))
  return devIssue
}

utils.getIssueCount = async function () {
  const { count } = await getJSON(utils.getProxyUrl('/issues/count'))
  return count ? count : 0
}

utils.getDevIssueCount = async function () {
  const { count } = await getJSON(utils.getProxyUrl('/issues/dev/count'))
  // return res.data.devIssueCount
  return count ? count : 0
}

function iosCopyClipboard(str) {
  const el = document.createElement('textarea')
  el.value = str
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'

  el.contentEditable = true
  el.readOnly = false

  document.body.appendChild(el)
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  if (selected) {
    // If a selection existed before copying
    document.getSelection().removeAllRanges()
    document.getSelection().addRange(selected)
  }
}

utils.createProposal = async function (sourceAcc, newParameters) {
  const source = sourceAcc.entry
  const issueCount = await utils.getIssueCount()
  const proposalCount = await utils.getProposalCount()

  if (issueCount >= 0 && proposalCount >= 0) {
    const proposalTx = {
      type: 'proposal',
      network,
      from: source.address,
      proposal: crypto.hash(
        `issue-${issueCount}-proposal-${proposalCount + 1}`
      ),
      issue: crypto.hash(`issue-${issueCount}`),
      parameters: newParameters,
      description: newParameters.description || '',
      timestamp: Date.now()
    }
    await signObj(proposalTx, source.keys)
    return proposalTx
  } else {
    if (!issueCount) throw new Error('Unable to get issue count')
    else if (!proposalCount) throw new Error('Unable to get proposal count')
  }
}

utils.createDevProposal = async function (sourceAcc, proposal) {
  const source = sourceAcc.entry
  let paymentCount
  let delay

  if (proposal.paymentType === 'multiple') {
    paymentCount = proposal.paymentCount
    delay = proposal.delay
  } else {
    paymentCount = 1
    delay = 0
  }
  console.log(proposal.paymentType, paymentCount, delay)

  const issueCount = await utils.getDevIssueCount()
  const proposalCount = await utils.getDevProposalCount()

  const payments = new Array(paymentCount).fill(1).map((_, i) => ({
    amount: BigInt(1) / BigInt(paymentCount),
    delay: delay * i
  }))
  console.log('Issue count:', issueCount)
  console.log('Proposal count:', proposalCount)
  if (issueCount >= 0 && proposalCount >= 0) {
    const tx = {
      type: 'dev_proposal',
      network,
      from: source.address,
      devIssue: crypto.hash(`dev-issue-${issueCount}`),
      devProposal: crypto.hash(
        `dev-issue-${issueCount}-dev-proposal-${proposalCount + 1}`
      ),
      totalAmount: proposal.totalAmount,
      payments: payments,
      description: proposal.description,
      title: proposal.title,
      payAddress: source.address,
      timestamp: Date.now()
    }
    await signObj(tx, source.keys)
    return tx
  } else {
    if (!issueCount) throw new Error('Unable to get issue count')
    else if (!proposalCount && proposalCount !== 0) {
      throw new Error('Unable to get dev proposal count')
    }
  }
}

utils.createEmailTx = async function (email, sourceAcc) {
  const source = sourceAcc.entry
  console.log(source)
  const signedTx = {
    emailHash: crypto.hash(email),
    from: source.address
  }
  await signObj(signedTx, source.keys)
  const tx = {
    type: 'email',
    network,
    signedTx,
    email: email,
    timestamp: Date.now()
  }
  return tx
}

utils.createVerifyTx = async function (code, sourceAcc) {
  const source = sourceAcc.entry
  const tx = {
    type: 'verify',
    network,
    from: source.address,
    code: code,
    timestamp: Date.now()
  }
  await signObj(tx, source.keys)
  return tx
}

utils.registerEmail = async function (email, sourceAcc) {
  const tx = await utils.createEmailTx(email, sourceAcc)
  return new Promise((resolve, reject) => {
    injectTx(tx).then(res => {
      console.log(res)
      if (res.result.success) resolve(true)
      else resolve(false)
    })
  })
}

utils.verifyEmail = async function (code, sourceAcc) {
  const tx = await utils.createVerifyTx(code, sourceAcc)
  return new Promise((resolve, reject) => {
    injectTx(tx).then(res => {
      console.log(res)
      if (res.result.success) resolve(true)
      else resolve(false)
    })
  })
}

utils.getDifferentParameter = function (newParameters, currentParameters) {
  const obj = {}
  const excludeKeys = ['hash', 'id', 'timestamp']
  for (const key in newParameters) {
    if (excludeKeys.indexOf(key) >= 0) continue
    if (
      currentParameters[key] &&
      currentParameters[key] !== newParameters[key]
    ) {
      obj[key] = newParameters[key]
    }
  }
  return obj
}

utils.submitProposl = function (tx) {
  return new Promise((resolve, reject) => {
    injectTx(tx).then(res => {
      console.log(res)
      if (res.result.success) resolve(true)
      else resolve(false)
    })
  })
}

utils.createVote = async function (
  sourceAcc,
  proposalNumber = 1,
  approve = true,
  amount = 50
) {
  const source = sourceAcc.entry
  const issueCount = await utils.getIssueCount()
  // const proposalCount = await utils.getProposalCount()
  const tx = {
    type: 'vote',
    network,
    from: source.address,
    issue: crypto.hash(`issue-${issueCount}`),
    proposal: crypto.hash(`issue-${issueCount}-proposal-${proposalNumber}`),
    approve: approve,
    amount: BigInt(amount),
    timestamp: Date.now()
  }
  await signObj(tx, source)
  return tx
}

utils.createDevVote = async function (
  sourceAcc,
  proposalNumber = 1,
  amount = 50,
  approve = true
) {
  const source = sourceAcc.entry
  const devIssueCount = await utils.getDevIssueCount()
  const tx = {
    type: 'dev_vote',
    network,
    from: source.address,
    devIssue: crypto.hash(`dev-issue-${devIssueCount}`),
    devProposal: crypto.hash(
      `dev-issue-${devIssueCount}-dev-proposal-${proposalNumber}`
    ),
    amount: BigInt(amount),
    approve,
    timestamp: Date.now()
  }
  await signObj(tx, source)
  return tx
}

utils.submitVote = async function (tx) {
  return new Promise((resolve, reject) => {
    injectTx(tx).then(res => {
      console.log(res)
      if (res.result.success) resolve(true)
      else resolve(false)
    })
  })
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    var successful = document.execCommand('copy')
    var msg = successful ? 'successful' : 'unsuccessful'
    console.log('Fallback: Copying text command was ' + msg)
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err)
  }

  document.body.removeChild(textArea)
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    console.log("Navigator.clipboard doesn't exist")
    fallbackCopyTextToClipboard(text)
    return
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log('Async: Copying to clipboard was successful!')
    },
    function (err) {
      console.error('Async: Could not copy text: ', err)
    }
  )
}

utils.copyToClipboard = text => {
  console.log(`is IOS Safari ${isIosSafari()}`)
  if (isIosSafari()) {
    iosCopyClipboard()
    return
  }
  return copyTextToClipboard(text)
}

utils.transferTokens = async (tgtHandle, amount, keys) => {
  const targetAddress = await getAddress(tgtHandle)
  const parameters = await utils.queryParameters()
  const tx = {
    type: 'transfer',
    from: keys.address,
    to: targetAddress,
    amount: BigInt(amount),
    timestamp: Date.now(),
    network,
    fee: parameters.current.transactionFee || BigInt(1)
  }
  await signObj(tx, keys)
  console.log(tx)
  return new Promise(resolve => {
    injectTx(tx).then(res => {
      console.log(res)
      if (res.result.success) resolve(true)
      else resolve(false)
    })
  })
}

utils.playSoundFile = soundFile => {
  // eslint-disable-next-line no-undef
  const audio = new Audio(soundFile)
  audio.play()
}

utils.updateBadge = (tabName, type) => {
  try {
    const badgeElementList = document.querySelectorAll(
      '.tabbar__badge.notification'
    )
    if (tabName === 'home') {
      if (type === 'increase') {
        const currentBadgeCount = parseInt(badgeElementList[0].innerHTML || 0)
        badgeElementList[0].innerHTML = currentBadgeCount + 1
      } else if (type === 'reset') {
        badgeElementList[0].innerHTML = ''
      }
    } else if (tabName === 'message') {
      if (type === 'increase') {
        const currentBadgeCount = parseInt(badgeElementList[1].innerHTML || 0)
        badgeElementList[1].innerHTML = currentBadgeCount + 1
      } else if (type === 'reset') {
        badgeElementList[1].innerHTML = ''
      }
    } else if (tabName === 'funding') {
      if (type === 'increase') {
        const currentBadgeCount = parseInt(badgeElementList[2].innerHTML || 0)
        badgeElementList[2].innerHTML = currentBadgeCount + 1
      } else if (type === 'reset') {
        badgeElementList[2].innerHTML = ''
      }
    } else if (tabName === 'economy') {
      if (type === 'increase') {
        const currentBadgeCount = parseInt(badgeElementList[3].innerHTML || 0)
        badgeElementList[3].innerHTML = currentBadgeCount + 1
      } else if (type === 'reset') {
        badgeElementList[3].innerHTML = ''
      }
    }
  } catch (e) { }
}

utils.queryEncryptedChats = async function (chatId) {
  try {
      const res = await axios.get(utils.getProxyUrl(`/messages/${chatId}`))
    console.log(res.data)
    return res.data.messages.map(m => crypto.safeJsonParse(m))
  } catch (e) {
    return []
  }
}

utils.isInitiator = (myAddress, otherPersonAddress) => {
  console.log('isInitiator', myAddress, otherPersonAddress)
  if (!myAddress || !otherPersonAddress) throw new Error('Invalid address in isInitiator')
  if (myAddress.length === 0 || otherPersonAddress.length === 0) throw new Error('Invalid address length in isInitiator')
  const isInitiator = [myAddress, otherPersonAddress].sort()[0] === myAddress
  console.log(`isInitiator: ${isInitiator}`)
  return isInitiator
}

utils.calculateWholeCycleDuration = function (window, devWindow) {
  if (window.proposalWindow && devWindow.devApplyWindow) {
    return devWindow.devApplyWindow[1] - window.proposalWindow[0]
  } else {
    return 1000 * 60 * 7
  }
}

utils.isNodeOnline = async function () {
  try {
    const res = await axios.get(utils.getProxyUrl('/issues/count'))
    if (res.status === 200) return true
  } catch (e) {
    console.warn(e.message)
    if (e.message === 'Network Error') return false
  }
}

utils.bytesArrayToHex = function (bytesArray) {
  return bytesArray.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '')
}

utils.aliasId = function (handle) {
  return crypto.hash(handle)
}

utils.getAddress = getAddress
utils.getAccountPublicKey = getAccountPublicKey
utils.getToll = getToll
utils.verboseLogs = verboseLogs

export default utils
