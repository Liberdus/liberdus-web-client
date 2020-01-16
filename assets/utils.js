/* eslint-disable no-console */
import axios from 'axios'
import CONFIG from '../config'
import crypto from 'shardus-crypto-web'
import stringify from 'fast-stable-stringify'
import { map, filter, sort, sortBy, orderBy, flow, concat } from 'lodash'
let host
const defaultSeedNode = `${CONFIG.server.ip}:${CONFIG.server.port}`
const storedSeedNode = localStorage.getItem('seednode')
const seedNodeHost = storedSeedNode || defaultSeedNode
console.log('stored seednode: ', storedSeedNode)
console.log('Seed node: ', seedNodeHost)

const utils = {}
const walletEntries = {}

utils.init = async defaultHost => {
  host = defaultHost
  await crypto.initialize(
    // '64f152869ca2d473e4ba64ab53f49ccdb2edae22da192c126850970e788af347'
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
  host = newHost
  return true
}
utils.isServerActive = async () => {
  try {
    const res = await axios.get(getAccountsUrl())
    const isActive = !!(res.status === 200 && res.data.accounts)
    return isActive
  } catch (e) {
    return false
  }
}
utils.getRandomHost = async () => {
  console.log(`http://${seedNodeHost}/nodelist`)
  const res = await axios.get(`http://${seedNodeHost}/nodelist`)
  const nodeList = res.data.nodeList
  const randIndex = Math.floor(Math.random() * nodeList.length)
  const randHost = nodeList[randIndex]
  if (!randHost) {
    throw new Error('Unable to get random host')
  }
  // if (randHost.ip === '127.0.0.1') randHost.ip = CONFIG.server.ip
  console.log(randHost)
  return randHost
}
utils.updateSeedNodeHost = async (ip, port) => {
  const seedNodeHost = `${ip}:${port}`
  localStorage.setItem('seednode', seedNodeHost)
  return seedNodeHost
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

utils.saveWallet = entries => {
  localStorage.setItem('account', JSON.stringify(entries))
}

utils.loadWallet = () => {
  try {
    const loadedEntries = localStorage.getItem('account')
    return JSON.parse(loadedEntries)
  } catch (e) {
    return null
  }
}
utils.loadLastMessage = () => {
  try {
    const loadedEntries = localStorage.getItem('lastMessage')
    return JSON.parse(loadedEntries)
  } catch (e) {
    return null
  }
}
utils.loadLastTx = () => {
  try {
    const loadedEntries = localStorage.getItem('lastTx')
    return JSON.parse(loadedEntries)
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
  return `http://${host}/inject`
}
function getAccountsUrl () {
  return `http://${host}/accounts`
}
function getAccountUrl (id) {
  return `http://${host}/account/${id}`
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

/**
 * interface tx {
 *   type: string
 *   from: string,
 *   to: string,
 *   amount: number,
 *   timestamp: number
 * }
 */
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
      `http://${host}/account/${friendId}/${yourId}/toll`
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
    const data = await getJSON(`http://${host}/address/${crypto.hash(handle)}`)
    const { address, error } = data
    if (error) {
      console.error(error)
      console.log(`http://${host}/address/${crypto.hash(handle)}`)
      console.log(`Error while getting address for ${handle}`)
    } else {
      return address
    }
  } catch (e) {
    // console.error(e.message)
    console.log(`Error while getting address for ${handle}`)
  }
}

async function pollMessages (from, to, timestamp) {
  try {
    const url = `http://${host}/messages/${to}/${from}`
    const { messages } = await getJSON(url)
    return messages
  } catch (err) {
    return err.message
  }
}

// wallet create <name> [id]
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
// import wallet
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
// wallet list [name]. Lists wallet for the given [name]. Otherwise, lists all wallets."
utils.listWallet = name => {
  const wallet = walletEntries[name]
  if (typeof wallet !== 'undefined' && wallet !== null) {
    console.log(`${JSON.stringify(wallet, null, 2)}`)
  } else {
    console.log(`${JSON.stringify(walletEntries, null, 2)}`)
  }
}

// handle create <handle> <source> | Creates a unique handle for the <source> account on the server
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

// Add Friend Function
utils.addFriend = async (tgt, keys) => {
  console.log(tgt)
  const targetAddress = await getAddress(tgt)
  if (targetAddress === undefined || targetAddress === null) {
    console.log("Target account doesn't exist for: ", tgt)
    return
  }
  const tx = {
    type: 'friend',
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

// Add Friend Function
utils.removeFriend = async (tgt, keys) => {
  const targetAddress = await getAddress(tgt)
  if (targetAddress === undefined || targetAddress === null) {
    console.log("Target account doesn't exist for: ", tgt)
    return
  }
  const tx = {
    type: 'remove_friend',
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

// Set Toll Function
utils.setToll = (toll, keys) => {
  const tx = {
    type: 'toll',
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

// message broadcast <message> <source> [recipients...]" | "broadcasts a <message> from <source> to all the [recipients...]
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
  console.log(requiredAmount)
  const tx = {
    type: 'broadcast',
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
  const { handle } = await getJSON(`http://${host}/account/${publicKey}/alias`)
  return handle
}

// Poll Messages function
utils.getMessages = async (srcEntry, tgt, timestamp) => {
  const targetAddress = await getAddress(tgt)
  const messages = await pollMessages(
    srcEntry.address,
    targetAddress,
    timestamp
  )
  return messages
}

// query [account] | Queries network data for the account associated with the given [wallet]. Otherwise, gets all network data.
utils.queryAccount = async handle => {
  let address
  if (handle) address = await getAddress(handle)
  // console.log(address)
  // console.log(
  //   `Querying network for ${
  //   address ? `'${handle}' wallet data` : "all data"
  //   }:`
  // );
  const accountData = await getAccountData(address)
  return accountData
}

// QUERY'S ALL NETWORK PROPOSALS
utils.queryProposals = async function () {
  const res = await axios.get(`http://${host}/proposals`)
  return res.data.proposals
}

// QUERY'S ALL NETWORK DEV_PROPOSALS
utils.queryDevProposals = async function () {
  const res = await axios.get(`http://${host}/proposals/dev`)
  return res.data.devProposals
}

// QUERY'S ALL PROPOSALS ON THE LATEST ISSUE
utils.queryLatestProposals = async function () {
  const res = await axios.get(`http://${host}/proposals/latest`)
  return res.data.proposals
}

// QUERY'S ALL PROPOSALS ON THE LATEST ISSUE
utils.queryLatestDevProposals = async function () {
  const res = await axios.get(`http://${host}/proposals/dev/latest`)
  // return res.data.devProposals
  return res.data.count
}

// QUERY'S THE CURRENT ISSUE'S PROPOSAL COUNT
utils.getProposalCount = async function () {
  const res = await axios.get(`http://${host}/proposals/count`)
  // return res.data.proposalCount
  return res.data.count
}

// QUERY'S THE CURRENT ISSUE'S PROPOSAL COUNT
utils.getDevProposalCount = async function () {
  const res = await axios.get(`http://${host}/proposals/dev/count`)
  // return res.data.devProposalCount
  return res.data.count
}

utils.isTransferTx = tx => tx.type === 'transfer'
utils.isMessageTx = tx => tx.type === 'message'
utils.isRegisterTx = tx => tx.type === 'register'
utils.isSender = (tx, myAddress) => tx.from === myAddress
utils.getTransferType = (tx, myAddress) =>
  utils.isSender(tx, myAddress) ? 'send' : 'receive'
utils.getMessageType = (tx, myAddress) =>
  utils.isSender(tx, myAddress) ? 'send_message' : 'receive_message'
utils.filterByTxType = (txList, type) => {
  if (type === 'transfer') return filter(txList, utils.isTransferTx)
  else if (type === 'message') return filter(txList, utils.isMessageTx)
  else if (type === 'register') return filter(txList, utils.isRegisterTx)
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

// QUERY'S THE CURRENT NETWORK PARAMETERS
utils.queryParameters = async function () {
  const res = await axios.get(`http://${host}/network/parameters`)
  if (res.data.error) {
    return res.data.error
  } else {
    return res.data.parameters
  }
}

// QUERY'S THE CURRENT NETWORK PARAMETERS ON HOST NODE (TESTING)
utils.queryNodeParameters = async function () {
  const res = await axios.get(`http://${host}/network/parameters/node`)
  if (res.data.error) {
    return res.data.error
  } else {
    return res.data.parameters
  }
}

// QUERY'S ALL NETWORK ISSUES
utils.queryIssues = async function () {
  const res = await axios.get(`http://${host}/issues`)
  return res.data.issues
}

// QUERY'S ALL NETWORK DEV_ISSUES
utils.queryDevIssues = async function () {
  const res = await axios.get(`http://${host}/issues/dev`)
  return res.data.devIssues
}

// QUERY'S THE MOST RECENT NETWORK ISSUE
utils.queryLatestIssue = async function () {
  const res = await axios.get(`http://${host}/issues/latest`)
  return res.data.issue
}

// QUERY'S THE MOST RECENT NETWORK DEV_ISSUE
utils.queryLatestDevIssue = async function () {
  const res = await axios.get(`http://${host}/issues/dev/latest`)
  return res.data.devIssue
}

// QUERY'S THE CURRENT NETWORK ISSUE COUNT
utils.getIssueCount = async function () {
  const res = await axios.get(`http://${host}/issues/count`)
  // return res.data.issueCount
  return res.data.count
}

// QUERY'S THE CURRENT NETWORK DEV_ISSUE COUNT
utils.getDevIssueCount = async function () {
  const res = await axios.get(`http://${host}/issues/dev/count`)
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
  console.log(proposal)
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
    amount: proposal.totalAmount / paymentCount,
    delay: delay * i
  }))
  console.log('Issue count:', issueCount)
  console.log('Proposal count:', proposalCount)
  if (issueCount >= 0 && proposalCount >= 0) {
    const tx = {
      type: 'dev_proposal',
      from: source.address,
      devIssue: crypto.hash(`dev-issue-${issueCount}`),
      devProposal: crypto.hash(
        `dev-issue-${issueCount}-dev-proposal-${proposalCount + 1}`
      ),
      totalAmount: proposal.totalAmount,
      payments: payments,
      description: proposal.title,
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
utils.createVote = async function (sourceAcc, proposalNumber = 1, amount = 50) {
  const source = sourceAcc.entry
  const issueCount = await utils.getIssueCount()
  const proposalCount = await utils.getProposalCount()
  const tx = {
    type: 'vote',
    from: source.address,
    issue: crypto.hash(`issue-${issueCount}`),
    proposal: crypto.hash(`issue-${issueCount}-proposal-${proposalNumber}`),
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

// Transfer Token Function
utils.transferTokens = async (tgtHandle, amount, keys) => {
  const targetAddress = await getAddress(tgtHandle)
  const tx = {
    type: 'transfer',
    from: keys.publicKey,
    to: targetAddress,
    amount: parseFloat(amount),
    timestamp: Date.now()
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
  const audio = new Audio(soundFile)
  audio.play()
}

utils.updateBadge = (tabName, type) => {
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
  }
}

utils.encryptMessage = function (message, otherPartyPubKey, mySecKey) {
  return crypto.encryptAB(message, otherPartyPubKey, mySecKey)
}
utils.decryptMessage = function (encryptedMessage, otherPartyPubKey, mySecKey) {
  // return {
  //   handle: 'tester1',
  //   body: encryptedMessage.substr(2, 10),
  //   timestamp: Date.now()
  // }
  return JSON.parse(
    crypto.decryptAB(encryptedMessage, otherPartyPubKey, mySecKey)
  )
}

utils.queryEncryptedChats = async function (chatId) {
  const res = await axios.get(`http://${host}/messages/${chatId}`)
  return res.data.messages
}

utils.getAddress = getAddress
utils.getToll = getToll
export default utils
