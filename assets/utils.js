/* eslint-disable no-console */
import axios from 'axios'
import CONFIG from '../config'
import crypto from 'shardus-crypto-web'
import stringify from "fast-stable-stringify"
let host
let seedNodeHost = `${CONFIG.server.ip}:${CONFIG.server.port}`
let utils = {}
let walletEntries = {}

utils.init = async (defaultHost) => {
  host = defaultHost
  await crypto.initialize(
    "64f152869ca2d473e4ba64ab53f49ccdb2edae22da192c126850970e788af347"
  );
  let sampleHash = crypto.hash("Hello World");
  return sampleHash
}

utils.updateHost = (newHost) => {
  host = newHost
  return true
}
utils.isServerActive = async () => {
  try {
    let res = await axios.get(getAccountsUrl())
    let isActive = (res.status === 200 && res.data.accounts) ? true : false
    return isActive
  } catch(e) {
    return false
  }
}
utils.getRandomHost = async () => {
  let res = await axios.get(`http://${seedNodeHost}/api/seednodes`)
  let seedNodes = res.data.seedNodes
  let randIndex = Math.floor(Math.random() * seedNodes.length)
  let randHost = seedNodes[randIndex]
  if (randHost.ip === '127.0.0.1') randHost.ip = CONFIG.server.ip
  console.log(randHost)
  return randHost
}
utils.updateSeedNodeHost = async (ip, port) => {
  seedNodeHost = `${ip}:${port}`
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

utils.saveWallet = (entries) => {
  localStorage.setItem('account', JSON.stringify(entries))
}

utils.loadWallet = () => {
  try {
    let loadedEntries = localStorage.getItem('account')
    return JSON.parse(loadedEntries)
  } catch {
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

function getInjectUrl() {
  return `http://${host}/inject`
}
function getAccountsUrl() {
  return `http://${host}/accounts`
}
function getAccountUrl(id) {
  return `http://${host}/account/${id}`
}

async function getJSON(url) {
  const response = await axios(url)
  return response.data
}
async function postJSON(url, obj) {
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
async function injectTx(tx) {
  try {
    const res = await postJSON(getInjectUrl(), tx)
    return res
  } catch (err) {
    console.warn(err)
    return err.message
  }
}

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
    let { toll } = await getJSON(`http://${host}/account/${friendId}/${yourId}/toll`)
    return toll
  } catch (err) {
    return err.message
  }
}

async function getAddress(handle) {
  if (!handle) return
  if (handle.length === 64) return handle
  try {
    const data = await getJSON(`http://${host}/address/${crypto.hash(handle)}`)
    const { address, error } = data
    if (error) {
      console.error(error)
      console.log(`Error while getting address for ${handle}`)
    } else {
      return address
    }
  } catch (e) {
    console.error(e.message)
    console.log(`Error while getting address for ${handle}`)
  }
}

async function pollMessages(from, to, timestamp) {
  try {
    let url = `http://${host}/messages/${to}/${from}`
    let { messages } = await getJSON(url)
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
utils.importWallet = async (sk) => {
  let keys = {
    publicKey: sk.slice(64),
    secretKey: sk
  };
  let handle = await utils.getHandle(keys.publicKey)
  let entry = {
    address: keys.publicKey,
    id: crypto.hash(handle),
    keys
  }
  return {
    handle, entry
  };
}
// wallet list [name]. Lists wallet for the given [name]. Otherwise, lists all wallets."
utils.listWallet = (name) => {
  let wallet = walletEntries[name];
  if (typeof wallet !== "undefined" && wallet !== null) {
    console.log(`${JSON.stringify(wallet, null, 2)}`);
  } else {
    console.log(`${JSON.stringify(walletEntries, null, 2)}`);
  }
}

// handle create <handle> <source> | Creates a unique handle for the <source> account on the server
utils.createHandle = async (handle, source) => {
  const tx = {
    type: "register",
    id: crypto.hash(handle),
    handle: handle.toLowerCase(),
    srcAcc: source.address,
    timestamp: Date.now()
  };
  crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey);
  console.log(tx)
  return new Promise(resolve => {
    injectTx(tx).then(res => {
      console.log(res);
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    });
  })
}

// Add Friend Function
utils.addFriend = async (tgt, keys) => {
  const targetAddress = await getAddress(tgt);
  if (targetAddress === undefined || targetAddress === null) {
    console.log("Target account doesn't exist for: ", tgt);
    return;
  }
  const tx = {
    type: "friend",
    handle: tgt,
    srcAcc: keys.publicKey,
    tgtAcc: targetAddress,
    amount: 1,
    timestamp: Date.now()
  };
  crypto.signObj(tx, keys.secretKey, keys.publicKey);
  return new Promise(resolve => {
    injectTx(tx).then(res => {
      console.log(res);
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    });
  })
}

// Add Friend Function
utils.removeFriend = async (tgt, keys) => {
  const targetAddress = await getAddress(tgt);
  if (targetAddress === undefined || targetAddress === null) {
    console.log("Target account doesn't exist for: ", tgt);
    return;
  }
  const tx = {
    type: "remove_friend",
    handle: tgt,
    srcAcc: keys.publicKey,
    tgtAcc: targetAddress,
    amount: 1,
    timestamp: Date.now()
  };
  crypto.signObj(tx, keys.secretKey, keys.publicKey);
  return new Promise(resolve => {
    injectTx(tx).then(res => {
      console.log(res);
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    });
  })
}

utils.claimTokens = (keys) => {
  const tx = {
    type: "claim_coins",
    srcAcc: keys.publicKey,
    timestamp: Date.now()
  };
  crypto.signObj(tx, keys.secretKey, keys.publicKey);
  return new Promise(resolve => {
    injectTx(tx).then(res => {
      console.log(res);
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    });
  })
}

// Set Toll Function
utils.setToll = (toll, keys) => {
  const tx = {
    type: "toll",
    srcAcc: keys.publicKey,
    toll: toll,
    amount: 1,
    timestamp: Date.now()
  };
  crypto.signObj(tx, keys.secretKey, keys.publicKey);
  return new Promise(resolve => {
    injectTx(tx).then(res => {
      console.log(res);
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    });
  })
}

utils.sendMessage = async (text, sourceAcc, targetHandle) => {
  const source = sourceAcc.entry
  const targetAddress = await getAddress(targetHandle);
  if (targetAddress === undefined || targetAddress === null) {
    console.log("Target account doesn't exist for: ", targetHandle);
    return
  }
  const message = stringify({
    body: text,
    timestamp: Date.now(),
    handle: sourceAcc.handle
  });
  // const encryptedMsg = crypto.encrypt(
  //   message,
  //   crypto.convertSkToCurve(source.keys.secretKey),
  //   crypto.convertPkToCurve(targetAddress)
  // );
  return new Promise(resolve => {
    getToll(targetAddress, source.address).then(toll => {
      const tx = {
        type: "message",
        srcAcc: source.address,
        tgtAcc: targetAddress,
        message: message,
        amount: toll,
        timestamp: Date.now()
      };
      crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey);
      injectTx(tx).then(res => {
        console.log(res);
        if (res.result.success) resolve(true)
        else resolve(false)
      });
    });
  })
}

// message broadcast <message> <source> [recipients...]" | "broadcasts a <message> from <source> to all the [recipients...]
utils.broadcastMessage = async (text, sourceAcc, recipients) => {
  const source = walletEntries[sourceAcc];
  let targetAccs = [];
  let messages = [];
  let requiredAmount = 0;
  for (let i = 0; i < recipients.length; i++) {
    console.log("RECIP: ", recipients[i]);
    let tgtAddress = await getAddress(recipients[i]);
    targetAccs.push(tgtAddress);
    let message = stringify({
      body: text,
      timestamp: Date.now(),
      handle: source
    });
    let encryptedMsg = crypto.encrypt(
      message,
      crypto.convertSkToCurve(source.keys.secretKey),
      crypto.convertPkToCurve(tgtAddress)
    );
    messages.push(encryptedMsg);
    requiredAmount += await getToll(tgtAddress, source.address);
  }
  console.log(requiredAmount);
  const tx = {
    type: "broadcast",
    messages: messages,
    srcAcc: source.address,
    tgtAccs: targetAccs,
    amount: requiredAmount,
    timestamp: Date.now()
  };
  crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey);
  injectTx(tx).then(res => {
    console.log(res);
  });
}

utils.getHandle = async (publicKey) => {
  // let { handle } = await getJSON(
  //   `http://${host}/account/${publicKey}/handle`
  // );
  // return handle;
  return null
}

// Poll Messages function
utils.getMessages = async (srcEntry, tgt, timestamp) => {
  const targetAddress = await getAddress(tgt);
  let messages = await pollMessages(srcEntry.address, targetAddress, timestamp)
  return messages;
}

// query [account] | Queries network data for the account associated with the given [wallet]. Otherwise, gets all network data.
utils.queryAccount = async (handle) => {
  let address
  if (handle) address = await getAddress(handle)
  // console.log(address)
  // console.log(
  //   `Querying network for ${
  //   address ? `'${handle}' wallet data` : "all data"
  //   }:`
  // );
  let accountData = await getAccountData(address);
  return accountData
}

function isIosSafari() {
  var ua = window.navigator.userAgent;
  var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
  var webkit = !!ua.match(/WebKit/i);
  var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
  return iOSSafari;
}

function iosCopyClipboard(str) {
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";

  el.contentEditable = true;
  el.readOnly = false;

  document.body.appendChild(el);
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  if (selected) {
    // If a selection existed before copying
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    console.log(`Navigator.clipboard doesn't exist`)
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log("Async: Copying to clipboard was successful!");
    },
    function (err) {
      console.error("Async: Could not copy text: ", err);
    }
  );
}

utils.copyToClipboard = (text) => {
  console.log(`is IOS Safari ${isIosSafari()}`)
  if (isIosSafari()) {
    iosCopyClipboard()
    return
  }
  return copyTextToClipboard(text);
}

// Transfer Token Function
utils.transferTokens = async (tgtHandle, amount, keys) => {
  const targetAddress = await getAddress(tgtHandle);
  const tx = {
    type: "transfer",
    srcAcc: keys.publicKey,
    tgtAcc: targetAddress,
    amount: parseFloat(amount),
    timestamp: Date.now()
  };
  console.log(keys)
  console.log(tx)
  crypto.signObj(tx, keys.secretKey, keys.publicKey);
  return new Promise(resolve => {
    injectTx(tx).then(res => {
      console.log(res);
      if (res.result.success) resolve(true)
      else resolve(false)
    });
  })
}

utils.playSoundFile = (soundFile) => {
  let audio = new Audio(soundFile);
  audio.play();
}

utils.getAddress = getAddress
utils.getToll = getToll
export default utils