<template>
  <v-ons-page>
    <notification :lastMessage="lastMessage" :lastTx="lastTx" />
    <!-- {{ getWallet }} -->

    <p style="display: none">{{ isUIReady }}</p>
    <div class="home-tab-container" v-if="isUIReady">
      <div class="total-balance">
        <h1 v-if="getAppState && getAppState.data.balance">
          {{ getAppState.data.balance.toFixed(3) }}
          <span class="total-unit">LBD</span>
        </h1>
        <h1 v-else>
          <v-ons-progress-circular indeterminate></v-ons-progress-circular>
        </h1>
      </div>
      <div>
        <h4 v-if="getAppState" class="user-alias">@{{ getWallet.handle }}</h4>
      </div>
      <div class="wallet-action-container">
        <div class="wallet-action">
          <button class="white-button" @click="$router.push('/wallet/send')">
            <v-ons-icon icon="ion-ios-send" size="lg"></v-ons-icon>Send
          </button>
        </div>
        <div class="wallet-action">
          <button class="white-button" @click="$router.push('/wallet/receive')">
            <v-ons-icon icon="ion-ios-download" size="lg"></v-ons-icon>Receive
          </button>
        </div>
      </div>
      <v-ons-list id="transaction-list">
        <v-ons-list-item
          v-for="transaction in transactions"
          :key="transaction.type + transaction.amount + transaction.timestamp"
        >
          <transaction-list-item :transaction="transaction" />
        </v-ons-list-item>
      </v-ons-list>
    </div>
  </v-ons-page>
</template>

<script>
import TransactionListItem from '~/components/TransactionListItem'
import { mapGetters, mapActions } from 'vuex'
import { map, filter, concat, flow, chain } from 'lodash'
import * as _ from 'lodash'
import utils from '../assets/utils'
import ToolBar from '~/components/ToolBar'
import Title from '~/components/baisc/Title'
import Button from '~/components/baisc/Button'
import Notification from '~/components/Notification'
export default {
  components: {
    TransactionListItem,
    ToolBar,
    Title,
    Button,
    Notification
  },
  data: function () {
    return {
      lastMessage: null,
      lastTx: null
    }
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      getLastMessage: 'chat/getLastMessage',
      getLastTx: 'chat/getLastTx',
      isUIReady: 'chat/isUIReady',
      getActiveProposals: 'proposal/getActiveProposals',
      getCompletedProposals: 'proposal/getCompletedProposals',
      getActiveDevProposals: 'proposal/getActiveDevProposals',
      getCompletedDevProposals: 'proposal/getCompletedDevProposals'
    }),
    transactions () {
      if (!this.getWallet || !this.getAppState) return []
      let myAddress = this.getWallet.entry.address
      let txs = this.getAppState.data.transactions
      const RawTransferTxs = utils.filterByTxType(txs, 'transfer')
      const RawMessageTxs = utils.filterByTxType(txs, 'message')
      const RawRegisterTxs = utils.filterByTxType(txs, 'register')
      const processRawTransferTxs = txList =>
        map(txList, tx => {
          return {
            type: utils.getTransferType(tx, myAddress),
            otherPersonAddress:
              tx.from.toLowerCase() === myAddress.toLowerCase()
                ? tx.to
                : tx.from,
            timestamp: tx.timestamp,
            amount: tx.amount
          }
        })
      const processRawMessageTxs = txList =>
        map(txList, tx => {
          return {
            type: utils.getMessageType(tx, myAddress),
            otherPersonAddress: tx.to,
            timestamp: tx.timestamp,
            amount: tx.amount
          }
        })
      const processRegisterTxs = txList =>
        map(txList, tx => {
          return {
            type: 'register',
            alias: tx.alias,
            timestamp: tx.timestamp,
            // TODO:
            amount: 0.001
          }
        })
      const transferTxs = processRawTransferTxs(RawTransferTxs)
      const messageeTxs = processRawMessageTxs(RawMessageTxs)
      const registerTx = processRegisterTxs(RawRegisterTxs)
      const allProcessedTxs = concat(transferTxs, messageeTxs, registerTx)
      return utils.sortByTimestamp(allProcessedTxs, 'desc')
    }
  },
  mounted: function () {
    this.refreshAppState()
    // let originalMessage = 'liberdus is awesome'
    // let encryptedMessage = utils.encryptMessage(
    //   originalMessage,
    //   this.getWallet.entry.keys
    // )
    // console.log(`Encrypt Message: `, encryptedMessage)
    // let decryptedMessage = utils.decryptMessage(
    //   'ca1bbfcd8e9ba12936ff91ae1b8c6959b0d9d9659949e8a2af55bf23a280c60a3238311a1de72e83acf8fcf476aed2f05d612cd4d52df8885b87beaff6f5504cecfbe7786c54890323120f173e',
    //   this.getWallet.entry.keys
    // )
    // console.log(originalMessage === decryptedMessage) // return true
  },
  methods: {
    ...mapActions({
      updateAppState: 'chat/updateAppState',
      updateLastMessage: 'chat/updateLastMessage',
      updateLastTx: 'chat/updateLastTx',
      setUIReady: 'chat/setUIReady',
      updateActiveProposals: 'proposal/updateActiveProposals',
      updateCompletedProposals: 'proposal/updateCompletedProposals',
      updateActiveDevProposals: 'proposal/updateActiveDevProposals',
      updateCompletedDevProposals: 'proposal/updateCompletedDevProposals'
    }),
    getLastTxFromAPI () {
      if (!this.getAppState) return
      let txs = this.getAppState.data.transactions
      return txs[txs.length - 1]
    },
    getLatestMessageFromServer (processedState) {
      let chats = processedState.data.chats
      let messageList = []
      for (let handle in chats) {
        chats[handle].messages.forEach(m => messageList.push(m))
      }
      if (messageList.length > 0) {
        let sortedMessageList = messageList.sort(
          (a, b) => b.timestamp - a.timestamp
        )
        return {
          body: sortedMessageList[0].body,
          timestamp: sortedMessageList[0].timestamp,
          handle: sortedMessageList[0].handle
        }
      } else
        return {
          body: null,
          timestamp: null,
          handle: null
        }
    },
    async processData (myAccountData) {
      let self = this
      try {
        let { account } = myAccountData
        let processed = { ...account }

        for (let otherPersonPk in processed.data.chats) {
          const chatId = processed.data.chats[otherPersonPk]
          const encryptedChatList = await utils.queryEncryptedChats(chatId)
          const decryptedChatList = encryptedChatList.map(data => {
            return utils.decryptMessage(
              data,
              otherPersonPk,
              self.getWallet.entry.keys.secretKey
            )
          })
          // console.log('Encrypted chats => ', encryptedChatList)
          // console.log('Decrypted chats => ', decryptedChatList)
          processed.data.chats[otherPersonPk] = {
            messages: decryptedChatList
          }
        }

        let keys = Object.keys(account.data.chats)
        let modifiedChats = {}
        for (let i = 0; i < keys.length; i++) {
          let handle = await utils.getHandle(keys[i])
          modifiedChats[handle] = account.data.chats[keys[i]]
        }

        processed.data.chats = modifiedChats
        let friendList = Object.values(processed.data.friends)
        friendList = friendList.filter(f => f !== null)
        processed.data.friends = friendList
        return processed
      } catch (e) {
        console.warn(`Unable to process account state data...`)
        console.warn(e)
        console.log(myAccountData)
      }
    },
    async refreshAppState () {
      let self = this
      if (self.getWallet && self.isUIReady) {
        // console.log('Refreshing App state...')
        let myHandle = this.getWallet.handle
        let myAccountData = await utils.queryAccount(myHandle)
        let processedState = await this.processData(myAccountData)
        self.updateAppState(processedState)
        let lastMessageFromServer = this.getLatestMessageFromServer(
          processedState
        )
        if (lastMessageFromServer.body) this.lastMessage = lastMessageFromServer
        let lastTxFromAPI = this.getLastTxFromAPI()
        if (lastTxFromAPI) {
          this.lastTx = lastTxFromAPI
        }
        setTimeout(this.refreshAppState, 10000)
      } else {
        setTimeout(this.refreshAppState, 5000)
      }
    }
  }
}
</script>

<style>
.home-tab-container {
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
}
.nuxt-link {
  width: 100%;
}
.total-balance h1 {
  font-family: Inconsolata;
  font-size: 42px;
  color: #2648d8;
  letter-spacing: 0;
  text-align: center;
  line-height: 42px;
  width: 300px;
  margin: 30px auto;
}
.total-balance h1 .total-unit {
  font-family: Poppins;
  font-size: 14px;
  color: #2648d8;
  letter-spacing: -0.16px;
  text-align: left;
  position: relative;
  top: -15px;
  left: -10px;
}
.new-message-btn {
  margin: 20px auto;
  width: 100%;
  text-align: center;
  font-size: 13px;
  cursor: pointer;
}
.wallet-action-container {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  max-width: 600px;
  margin: 50px auto;
}
.wallet-action {
  display: flex;
  flex-direction: column;
  justify-content: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #0076ff;
}
#transaction-list {
  margin-bottom: 20px;
}
.wallet-action ons-icon {
  text-align: center;
}
.list {
  max-width: 600px;
  margin: 0 auto;
}
.white-button {
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
  border-radius: 27.5px;
  font-family: Poppins;
  font-size: 16px;
  color: #0a2463;
  letter-spacing: 0;
  line-height: 20px;
  width: 145px;
  height: 55px;
  border: none;
  outline: none;
  cursor: pointer;
}

.white-button .ons-icon {
  margin-right: 10px;
}
.home-tab-container .user-alias {
  text-align: center;
  color: #092363;
  font-family: Poppins !important;
  font-size: 20px;
}
</style>
