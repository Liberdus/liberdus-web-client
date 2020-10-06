/* eslint-disable no-console */
import axios from 'axios'
import crypto from 'shardus-crypto-web'
import stringify from 'fast-stable-stringify'
// eslint-disable-next-line no-unused-vars
import { map, filter, sort, sortBy, orderBy, flow, concat } from 'lodash'
import config from '../config'
let host
const defaultSeedNode = `${config.server.ip}:${config.server.port}`
// eslint-disable-next-line no-undef
const storedSeedNode = localStorage.getItem('seednode')
const seedNodeHost = storedSeedNode || defaultSeedNode
const utils = {}
const walletEntries = {}
const network = '0'.repeat(64)

utils.init = async defaultHost => {
  host = defaultHost
  await crypto.initialize(
    '69fa4195670576c0160d660c3be36556ff8d504725be8a59b5a96509e0c994bc'
  )
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
  console.log('Host is updated: ', newHost)
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
  let ip, port
  if (!option) {
    ip = host.split(':')[0]
    port = host.split(':')[1]
  } else if (option) {
    ip = option.ip
    port = option.port
  }
  if (ip === 'localhost' || ip === '127.0.0.1') {
    return `http://localhost:${port}${url}`
  }
  return `https://${config.proxy.ip}:${config.proxy.port}/rproxy/${ip}:${port}${url}`
}

utils.getProxyUrlWithRandomHost = async function (url, option) {
  const randomHost = await this.getRandomHost()
  const {ip, port} = randomHost

  if (ip === 'localhost' || ip === '127.0.0.1') {
    return `http://localhost:${port}${url}`
  }
  return `https://${config.proxy.ip}:${config.proxy.port}/rproxy/${ip}:${port}${url}`
}

utils.getRandomHost = async () => {
  console.log('getRandomHost:\n')
  console.log(seedNodeHost)
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
  console.log('Seed node is updated locally')
  // eslint-disable-next-line no-undef
  localStorage.setItem('seednode', seedNodeHost)
}

utils.isSeedNodeOnline = async (ip, port) => {
  console.log('isSeedNodeOnline')
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

utils.createAccount = (keys = crypto.generateKeypair()) => {
  return {
    address: keys.publicKey,
    keys
  }
}

utils.saveWallet = newWalletEntry => {
  try {
    // eslint-disable-next-line no-undef
    const existingWalletList = JSON.parse(localStorage.getItem('wallets'))
    const newWallet = [...existingWalletList]
      .filter(w => w.handle !== newWalletEntry.handle)
      .concat(newWalletEntry)
    console.log('new wallet', newWallet)
    // eslint-disable-next-line no-undef
    localStorage.setItem('wallets', JSON.stringify(newWallet))
  } catch (e) {
    console.log(e)
    console.log(JSON.stringify([newWalletEntry]))
    // eslint-disable-next-line no-undef
    localStorage.setItem('wallets', JSON.stringify([newWalletEntry]))
  }
}

utils.loadWallet = username => {
  try {
    // eslint-disable-next-line no-undef
    const loadedEntries = localStorage.getItem('wallets')
    const walletList = JSON.parse(loadedEntries)
    return walletList.find(w => w.handle === username)
  } catch (e) {
    return null
  }
}

utils.loadLastMessage = username => {
  try {
    // eslint-disable-next-line no-undef
    const loadedEntries = localStorage.getItem('lastMessage')
    const lastMessage = JSON.parse(loadedEntries)
    return lastMessage[username]
  } catch (e) {
    return null
  }
}

utils.loadLastTx = username => {
  try {
    // eslint-disable-next-line no-undef
    const loadedEntries = localStorage.getItem('lastTx')
    const lastTx = JSON.parse(loadedEntries)
    return lastTx[username]
  } catch (e) {
    return null
  }
}

utils.createAccountAndStoreInWallet = (name, id) => {
  const account = utils.createAccount()
  if (typeof id === 'undefined' || id === null) {
    id = crypto.hash(name)
  }
  account.id = id
  return account
}

function getInjectUrl () {
  return utils.getProxyUrl('/inject')
}

function getAccountsUrl () {
  return utils.getProxyUrl('/accounts')
}

function getAccountUrl (id) {
  console.log(utils.getProxyUrl(`/account/${id}`))
  return utils.getProxyUrl(`/account/${id}`)
}

async function getJSON (url) {
  const response = await axios(url)
  return response.data
}

async function postJSON (url, obj) {
  console.log(obj)
  const response = await axios.post(url, obj)
  return response.data
}

async function injectTx (tx) {
  try {
    const res = await postJSON(getInjectUrl(), tx)
    return res
  } catch (err) {
    console.warn(err)
    return err.message
  }
}

async function getAccountData (id) {
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

async function getToll (friendId, yourId) {
  try {
    const { toll } = await getJSON(
      utils.getProxyUrl(`/account/${friendId}/${yourId}/toll`)
    )
    return toll
  } catch (err) {
    return err.message
  }
}

async function getAddress (handle) {
  if (!handle) return
  if (handle.length === 64) return handle
  try {
    for (let i = 0; i < 3; i ++) {
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
    console.log(e)
  }
  return null
}

async function pollMessages (from, to, timestamp) {
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
  const keys = {
    publicKey: sk.slice(64),
    secretKey: sk
  }
  const handle = await utils.getHandle(keys.publicKey)
  const entry = {
    address: keys.publicKey,
    id: crypto.hash(handle),
    keys
  }
  return {
    handle,
    entry
  }
}

utils.listWallet = name => {
  const wallet = walletEntries[name]
  if (typeof wallet !== 'undefined' && wallet !== null) {
    console.log(`${JSON.stringify(wallet, null, 2)}`)
  } else {
    console.log(`${JSON.stringify(walletEntries, null, 2)}`)
  }
}

utils.registerAlias = async (handle, source) => {
  const tx = {
    type: 'register',
    aliasHash: crypto.hash(handle),
    from: source.address,
    alias: handle,
    timestamp: Date.now()
  }
  crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey)
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
    from: keys.publicKey,
    to: targetAddress,
    amount: 1,
    timestamp: Date.now()
  }
  crypto.signObj(tx, keys.secretKey, keys.publicKey)
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
    from: keys.publicKey,
    to: targetAddress,
    amount: 1,
    timestamp: Date.now()
  }
  crypto.signObj(tx, keys.secretKey, keys.publicKey)
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

utils.claimTokens = keys => {
  const tx = {
    type: 'claim_coins',
    network,
    srcAcc: keys.publicKey,
    timestamp: Date.now()
  }
  crypto.signObj(tx, keys.secretKey, keys.publicKey)
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

utils.setToll = (toll, keys) => {
  const tx = {
    type: 'toll',
    network,
    from: keys.publicKey,
    toll: parseFloat(toll),
    timestamp: Date.now()
  }
  crypto.signObj(tx, keys.secretKey, keys.publicKey)
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

utils.addStake = (stake, keys) => {
  const tx = {
    type: 'stake',
    network,
    from: keys.publicKey,
    stake: stake,
    timestamp: Date.now()
  }
  crypto.signObj(tx, keys.secretKey, keys.publicKey)
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

utils.removeStake = (stake, keys) => {
  const tx = {
    type: 'remove_stake',
    network,
    from: keys.publicKey,
    stake: stake,
    timestamp: Date.now()
  }
  crypto.signObj(tx, keys.secretKey, keys.publicKey)
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

utils.requestRemoveStake = (stake, keys) => {
  const tx = {
    type: 'remove_stake_request',
    network,
    from: keys.publicKey,
    stake: stake,
    timestamp: Date.now()
  }
  crypto.signObj(tx, keys.secretKey, keys.publicKey)
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

utils.sendMessage = async (text, sourceAcc, targetHandle) => {
  const source = sourceAcc.entry
  const targetAddress = await getAddress(targetHandle)
  if (targetAddress === undefined || targetAddress === null) {
    console.log("Target account doesn't exist for: ", targetHandle)
    return
  }
  const message = stringify({
    body: text,
    timestamp: Date.now(),
    handle: sourceAcc.handle
  })
  const encryptedMsg = utils.encryptMessage(
    message,
    targetAddress,
    source.keys.secretKey
  )
  return new Promise(resolve => {
    getToll(targetAddress, source.address).then(toll => {
      const tx = {
        type: 'message',
        network,
        from: source.address,
        to: targetAddress,
        chatId: crypto.hash([source.address, targetAddress].sort().join``),
        message: encryptedMsg,
        amount: toll,
        timestamp: Date.now()
      }
      crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey)
      injectTx(tx).then(res => {
        console.log(res)
        if (res.result.success) resolve(true)
        else resolve(false)
      })
    })
  })
}

utils.broadcastMessage = async (text, sourceAcc, recipients) => {
  const source = walletEntries[sourceAcc]
  const targetAccs = []
  const messages = []
  let requiredAmount = 0
  for (let i = 0; i < recipients.length; i++) {
    console.log('RECIP: ', recipients[i])
    const tgtAddress = await getAddress(recipients[i])
    targetAccs.push(tgtAddress)
    const message = stringify({
      body: text,
      timestamp: Date.now(),
      handle: source
    })
    const encryptedMsg = crypto.encrypt(
      message,
      crypto.convertSkToCurve(source.keys.secretKey),
      crypto.convertPkToCurve(tgtAddress)
    )
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
  crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey)
  injectTx(tx).then(res => {
    console.log(res)
  })
}

utils.getHandle = async publicKey => {
  const { handle } = await getJSON(
    utils.getProxyUrl(`/account/${publicKey}/alias`)
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
  const res = await axios.get(utils.getProxyUrl('/proposals'))
  return res.data.proposals
}

utils.queryDevProposals = async function () {
  const res = await axios.get(utils.getProxyUrl('/proposals/dev'))
  return res.data.devProposals
}

utils.queryLatestProposals = async function () {
  const res = await axios.get(utils.getProxyUrl('/proposals/latest'))
  return res.data.proposals
}

utils.queryLatestDevProposals = async function () {
  const res = await axios.get(utils.getProxyUrl('/proposals/dev/latest'))
  return res.data.devProposals
  // return res.data.count
}

utils.getProposalCount = async function () {
  const res = await axios.get(utils.getProxyUrl('/proposals/count'))
  // return res.data.proposalCount
  return res.data.count
}

utils.getDevProposalCount = async function () {
  const res = await axios.get(utils.getProxyUrl('/proposals/dev/count'))
  // return res.data.devProposalCount
  if (res.data.count) return res.data.count
  else return 0
}

utils.isTransferTx = tx => tx.type === 'transfer'
utils.isProposalTx = tx => tx.type === 'proposal'
utils.isDevProposalTx = tx => tx.type === 'dev_proposal'
utils.isVoteTx = tx => tx.type === 'vote'
utils.isDevVoteTx = tx => tx.type === 'dev_vote'
utils.isDevPaymentTx = tx => tx.type === 'developer_payment'
utils.isMessageTx = tx => tx.type === 'message'
utils.isRegisterTx = tx => tx.type === 'register'
utils.isStakeTx = tx => tx.type === 'stake'
utils.isRemoveStakeTx = tx => tx.type === 'remove_stake'
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
  else if (type === 'stake') return filter(txList, utils.isStakeTx)
  else if (type === 'remove_stake') return filter(txList, utils.isRemoveStakeTx)
  else if (type === 'node_reward') return filter(txList, utils.isRewardTx)
}

utils.sortByTimestamp = (list, direction) => {
  if (direction === 'desc') {
    return orderBy(list, ['timestamp'], ['desc'])
  } else {
    return orderBy(list, ['timestamp'], ['asc'])
  }
}

function isIosSafari () {
  var ua = window.navigator.userAgent
  var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)
  var webkit = !!ua.match(/WebKit/i)
  var iOSSafari = iOS && webkit && !ua.match(/CriOS/i)
  return iOSSafari
}

utils.queryParameters = async function (component) {
  // console.log(`Calling from ${component}`)
  const res = await axios.get(utils.getProxyUrl('/network/parameters'))
  if (res.data.error) {
    return res.data.error
  } else {
    return res.data.parameters
  }
}

utils.queryNodeParameters = async function () {
  const res = await axios.get(utils.getProxyUrl('/network/parameters/node'))
  if (res.data.error) {
    return res.data.error
  } else {
    return res.data.parameters
  }
}

utils.queryIssues = async function () {
  const res = await axios.get(utils.getProxyUrl('/issues'))
  return res.data.issues
}

utils.queryDevIssues = async function () {
  const res = await axios.get(utils.getProxyUrl('/issues/dev'))
  return res.data.devIssues
}

utils.queryLatestIssue = async function () {
  const res = await axios.get(utils.getProxyUrl('/issues/latest'))
  return res.data.issue
}

utils.queryLatestDevIssue = async function () {
  const res = await axios.get(utils.getProxyUrl('/issues/dev/latest'))
  return res.data.devIssue
}

utils.getIssueCount = async function () {
  const res = await axios.get(utils.getProxyUrl('/issues/count'))
  // return res.data.issueCount
  return res.data.count
}

utils.getDevIssueCount = async function () {
  const res = await axios.get(utils.getProxyUrl('/issues/dev/count'))
  // return res.data.devIssueCount
  return res.data.count
}

function iosCopyClipboard (str) {
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
    crypto.signObj(proposalTx, source.keys.secretKey, source.keys.publicKey)
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
    amount: 1 / paymentCount,
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
    crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey)
    return tx
  } else {
    if (!issueCount) throw new Error('Unable to get issue count')
    else if (!proposalCount && proposalCount !== 0) {
      throw new Error('Unable to get dev proposal count')
    }
  }
}

utils.createEmailTx = function (email, sourceAcc) {
  const source = sourceAcc.entry
  console.log(source)
  const signedTx = {
    emailHash: crypto.hash(email),
    from: source.address
  }
  crypto.signObj(signedTx, source.keys.secretKey, source.keys.publicKey)
  const tx = {
    type: 'email',
    network,
    signedTx,
    email: email,
    timestamp: Date.now()
  }
  return tx
}

utils.createVerifyTx = function (code, sourceAcc) {
  const source = sourceAcc.entry
  const tx = {
    type: 'verify',
    network,
    from: source.address,
    code: code,
    timestamp: Date.now()
  }
  crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey)
  return tx
}

utils.registerEmail = function (email, sourceAcc) {
  const tx = utils.createEmailTx(email, sourceAcc)
  return new Promise((resolve, reject) => {
    injectTx(tx).then(res => {
      console.log(res)
      if (res.result.success) resolve(true)
      else resolve(false)
    })
  })
}

utils.verifyEmail = function (code, sourceAcc) {
  const tx = utils.createVerifyTx(code, sourceAcc)
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
    amount: amount,
    timestamp: Date.now()
  }
  crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey)
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
    amount,
    approve,
    timestamp: Date.now()
  }
  crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey)
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

function fallbackCopyTextToClipboard (text) {
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

function copyTextToClipboard (text) {
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
    from: keys.publicKey,
    to: targetAddress,
    amount: parseFloat(amount),
    timestamp: Date.now(),
    network,
    fee: parameters.current.transactionFee || 0.001
  }
  crypto.signObj(tx, keys.secretKey, keys.publicKey)
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
  } catch (e) {}
}

utils.encryptMessage = function (message, otherPartyPubKey, mySecKey) {
  return crypto.encryptAB(message, otherPartyPubKey, mySecKey)
}

utils.decryptMessage = function (encryptedMessage, otherPartyPubKey, mySecKey) {
  return JSON.parse(
    crypto.decryptAB(encryptedMessage, otherPartyPubKey, mySecKey)
  )
}

utils.queryEncryptedChats = async function (chatId) {
  const res = await axios.get(utils.getProxyUrl(`/messages/${chatId}`))
  return res.data.messages
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

utils.getAddress = getAddress
utils.getToll = getToll
export default utils
