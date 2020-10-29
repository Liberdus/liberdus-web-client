<template>
  <!-- <v-ons-page> -->
  <div>
    <notification
      :last-message="lastMessage"
      :last-tx="lastTx"
    />
    <p style="display: none">
      {{ isUIReady }}
    </p>
    <div
      v-if="isUIReady"
      class="home-tab-container"
    >
      <!-- <p v-if="getAppState">{{ getAppState }}</p> -->
      <div class="total-balance">
        <h1 v-if="getAppState && getAppState.data.balance >= 0">
          {{ getAppState.data.balance.toFixed(3) }}
          <span class="total-unit">LBD</span>
        </h1>
        <h1 v-else>
          <v-ons-progress-circular indeterminate />
        </h1>
        <p
          v-if="getAppState && !getAppState.emailHash"
          class="register-reminder"
        >
          <nuxt-link to="/email/register">
            <strong>Register</strong>
          </nuxt-link>
          your email to earn some coins
        </p>
      </div>
      <div>
        <h4
          v-if="getAppState"
          class="user-alias"
        >
          @{{ getWallet.handle }}
        </h4>
      </div>
      <div class="wallet-action-container" v-if="getAppState && getAppState.data.balance >= 0">
        <div class="wallet-action">
          <!-- <button class="white-button" @click="$router.push('/wallet/send')">
            <v-ons-icon icon="ion-ios-send" size="lg"></v-ons-icon>Send
          </button> -->
          <a-button 
            type="primary" 
            shape="round" 
            size="large" 
            icon="check" 
            @click="$router.push('/wallet/send')"
          >
            Send
          </a-button>
        </div>
        <div class="wallet-action">
          <!-- <button class="white-button" @click="$router.push('/wallet/receive')">
            <v-ons-icon icon="ion-ios-download" size="lg"></v-ons-icon>Receive
          </button> -->
          <a-button 
            shape="round" 
            size="large" 
            icon="download"
            @click="$router.push('/wallet/receive')"
          >
            Receive
          </a-button>
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
  <!-- </v-ons-page> -->
  </div>
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
      lastTx: null,
      previousUrl: null
    }
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      getNetwork: 'chat/getNetwork',
      getTimers: 'chat/getTimers',
      getLastMessage: 'chat/getLastMessage',
      isUIReady: 'chat/isUIReady',
      getWindowFocus: 'chat/getWindowFocus',
      getHandleDictionary: 'chat/getHandleDictionary',
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
      const RawStakeTxs = utils.filterByTxType(txs, 'stake')
      const RawRemoveStakeTxs = utils.filterByTxType(txs, 'remove_stake')
      const RawRewardTxs = utils.filterByTxType(txs, 'node_reward')
      const RawProposalTxs = utils.filterByTxType(txs, 'proposal')
      const RawDevProposalTxs = utils.filterByTxType(txs, 'dev_proposal')
      const RawVoteTxs = utils.filterByTxType(txs, 'vote')
      const RawDevVoteTxs = utils.filterByTxType(txs, 'dev_vote')
      const RawDevPaymentTxs = utils.filterByTxType(txs, 'developer_payment')
      const processRawTransferTxs = txList =>
        map(txList, tx => {
          return {
            type: utils.getTransferType(tx, myAddress),
            otherPersonAddress:
              tx.from.toLowerCase() === myAddress.toLowerCase()
                ? tx.to
                : tx.from,
            timestamp: tx.timestamp,
            amount: tx.amount,
            fee: tx.fee
          }
        })
      const processRawStakeTxs = txList =>
        map(txList, tx => {
          return {
            type: 'stake',
            timestamp: tx.timestamp,
            otherPersonAddress: 'NETWORK',
            amount: tx.stake,
            fee: 0
          }
        })
      const processRawRemoveStakeTxs = txList =>
        map(txList, tx => {
          return {
            type: 'remove_stake',
            timestamp: tx.timestamp,
            otherPersonAddress: 'NETWORK',
            amount: tx.stake,
            fee: 0
          }
        })
      const processRawRewardTxs = txList =>
        map(txList, tx => {
          return {
            type: 'node_reward',
            timestamp: tx.timestamp,
            otherPersonAddress: 'NETWORK',
            amount: this.networkParameters
              ? this.networkParameters.current.nodeRewardAmount
              : 1,
            fee: 0
          }
        })
      const processRawMessageTxs = txList =>
        map(txList, tx => {
          const type = utils.getMessageType(tx, myAddress)
          const otherPersonAddress = type === 'receive_message' ? tx.from : tx.to

          return {
            type,
            otherPersonAddress,
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
      const processProposalTxs = txList =>
        map(txList, tx => {
          return {
            type: 'proposal',
            otherPersonAddress: 'NETWORK',
            timestamp: tx.timestamp,
            amount: this.networkParameters
              ? this.networkParameters.current.proposalFee
              : 1
          }
        })
      const processDevProposalTxs = txList =>
        map(txList, tx => {
          return {
            type: 'dev_proposal',
            otherPersonAddress: 'NETWORK',
            timestamp: tx.timestamp,
            amount: this.networkParameters
              ? this.networkParameters.current.devProposalFee
              : 1
          }
        })
      const processVoteTxs = txList =>
        map(txList, tx => {
          return {
            type: 'vote',
            otherPersonAddress: 'NETWORK',
            timestamp: tx.timestamp,
            amount: tx.amount
          }
        })
      const processDevVoteTxs = txList =>
        map(txList, tx => {
          return {
            type: 'dev_vote',
            otherPersonAddress: 'NETWORK',
            timestamp: tx.timestamp,
            amount: tx.amount
          }
        })
      const processDevPaymentTxs = txList =>
        map(txList, tx => {
          return {
            type: 'developer_payment',
            otherPersonAddress: 'NETWORK',
            timestamp: tx.timestamp,
            amount: tx.payment.amount
          }
        })
      const transferTxs = processRawTransferTxs(RawTransferTxs)
      const stakeTxs = processRawStakeTxs(RawStakeTxs)
      const removeStakeTxs = processRawRemoveStakeTxs(RawRemoveStakeTxs)
      const rewardTxs = processRawRewardTxs(RawRewardTxs)
      const messageeTxs = processRawMessageTxs(RawMessageTxs)
      const registerTx = processRegisterTxs(RawRegisterTxs)
      const proposalTxs = processProposalTxs(RawProposalTxs)
      const devProposalTxs = processDevProposalTxs(RawDevProposalTxs)
      const voteTxs = processVoteTxs(RawVoteTxs)
      const devVoteTxs = processDevVoteTxs(RawDevVoteTxs)
      const devPaymentTxs = processDevPaymentTxs(RawDevPaymentTxs)
      const allProcessedTxs = concat(
        transferTxs,
        messageeTxs,
        registerTx,
        stakeTxs,
        removeStakeTxs,
        rewardTxs,
        proposalTxs,
        devProposalTxs,
        voteTxs,
        devVoteTxs,
        devPaymentTxs
      )
      return utils.sortByTimestamp(allProcessedTxs, 'desc')
    }
  },
  mounted: function () {
    this.refreshAppState()
    if (!this.getTimers['appRefresher']) {
      const appRefresher = setInterval(this.refreshAppState, 10000)
      this.addTimer({ key: 'appRefresher', value: appRefresher })
    }
  },
  methods: {
    ...mapActions({
      updateAppState: 'chat/updateAppState',
      updateLastMessage: 'chat/updateLastMessage',
      updateLastTx: 'chat/updateLastTx',
      setUIReady: 'chat/setUIReady',
      addHandle: 'chat/addHandle',
      updateActiveProposals: 'proposal/updateActiveProposals',
      updateCompletedProposals: 'proposal/updateCompletedProposals',
      updateActiveDevProposals: 'proposal/updateActiveDevProposals',
      updateCompletedDevProposals: 'proposal/updateCompletedDevProposals',
      addTimer: 'chat/addTimer'
    }),
    notifyToRegisterEmail () {
      this.$ons.notification.alert(
        'Please register your email to earn some initial coins.'
      )
    },
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
          processed.data.chats[otherPersonPk] = {
            messages: decryptedChatList
          }
        }

        let keys = Object.keys(account.data.chats)
        let modifiedChats = {}
        for (let i = 0; i < keys.length; i++) {
          let handle
          if (this.getHandleDictionary[keys[i]]) {
            handle = this.getHandleDictionary[keys[i]]
          } else {
            handle = await utils.getHandle(keys[i])
            this.addHandle({address: keys[i], handle})
          }
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
      }
    },
    getActiveWindow (window, proposalType) {
      if (!window || !proposalType) return
      const now = Date.now()
      if (proposalType === 'economy') {
        if (now >= window.proposalWindow[0] && now < window.proposalWindow[1]) {
          return 'PROPOSAL'
        } else if (
          now >= window.votingWindow[0] &&
          now < window.votingWindow[1]
        ) {
          return 'VOTING'
        } else if (
          now >= window.graceWindow[0] &&
          now < window.graceWindow[1]
        ) {
          return 'GRACE'
        } else if (
          now >= window.applyWindow[0] &&
          now < window.applyWindow[1]
        ) {
          return 'APPLY'
        }
      } else if (proposalType === 'funding') {
        if (
          now >= window.devProposalWindow[0] &&
          now < window.devProposalWindow[1]
        ) {
          return 'PROPOSAL'
        } else if (
          now >= window.devVotingWindow[0] &&
          now < window.devVotingWindow[1]
        ) {
          return 'VOTING'
        } else if (
          now >= window.devGraceWindow[0] &&
          now < window.devGraceWindow[1]
        ) {
          return 'GRACE'
        } else if (
          now >= window.devApplyWindow[0] &&
          now < window.devApplyWindow[1]
        ) {
          return 'APPLY'
        }
      }
      return 'IDLE'
    },
    async getWindowObj (proposalType) {
      try {
        let newNetworkParameters = await utils.queryParameters(
          `/home, getWindowObj`
        )
        if (!this.networkParameters) {
          this.networkParameters = newNetworkParameters
        }
        const WINDOW_TYPE =
          proposalType === 'economy' ? 'windows' : 'devWindows'
        let window = newNetworkParameters[WINDOW_TYPE]
        return window
      } catch (e) {
        console.warn(e)
        return null
      }
    },
    async refreshAppState () {
      let self = this
      console.log('Refreshing app state...', self.getWallet, self.isUIReady, self, this, this.getWallet)
      if (!this.getWindowFocus) return
      if (self.getWallet && self.isUIReady) {
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
          this.lastTx = { ...lastTxFromAPI }
          this.lastTx.walletUsername = myHandle
          this.lastTx.timestamp = Date.now()
        }
        this.refreshProposalList()
      }
      console.log('end Refreshing app state...')
    },
    async refreshProposalList () {
      if (!this.getWindowFocus) return
      let allProposals = await utils.queryLatestProposals()
      let networkParameters = await utils.queryParameters(
        `/home, refreshProposalList`
      )
      this.networkParameters = networkParameters
      allProposals = allProposals.map(proposal => {
        let proposedParameters = utils.getDifferentParameter(
          proposal.parameters,
          networkParameters['current']
        )
        let obj = { ...proposal }
        obj.proposedParameters = proposedParameters
        obj.type = 'proposal'
        return obj
      })
      // let activeProposalList = allProposals.filter(proposal => {
      //   return !proposal.hasOwnProperty('winner')
      // })
      let activeProposalList = [...allProposals]
      let window = await this.getWindowObj('economy')
      let activeEconomyWindow = this.getActiveWindow(window, 'economy')

      if (activeEconomyWindow === 'VOTING') {
        const count = activeProposalList.length
        let economyProposalCount =
          JSON.parse(localStorage.getItem('economy_proposal_count')) || 0
        if (count > economyProposalCount) {
          let diff = count - economyProposalCount
          for (let i = 0; i < diff; i++) {
            utils.updateBadge('economy', 'increase')
            localStorage.setItem('economy_proposal_count', count)
          }
        }
      } else {
        try {
          utils.updateBadge('economy', 'reset')
          localStorage.setItem('economy_proposal_count', 0)
        } catch (e) {
          // console.warn(e);
        }
      }

      // Funding proposals start here
      let allDevProposals = await utils.queryDevProposals()
      if (!allDevProposals || allDevProposals.length === 0) return
      allDevProposals = allDevProposals.map(proposal => {
        let obj = { ...proposal }
        obj.type = 'dev_proposal'
        return obj
      })

      let activeDevProposalList = allDevProposals.filter(
        proposal => proposal.approved !== true && proposal.approved !== false
      )

      let devWindow = await this.getWindowObj('funding')
      let activeFundingWindow = this.getActiveWindow(devWindow, 'funding')

      if (activeFundingWindow === 'VOTING') {
        const count = activeDevProposalList.length
        let fundingProposalCount =
          JSON.parse(localStorage.getItem('funding_proposal_count')) || 0
        if (count > fundingProposalCount) {
          let diff = count - fundingProposalCount
          for (let i = 0; i < diff; i++) {
            utils.updateBadge('funding', 'increase')
            localStorage.setItem('funding_proposal_count', count)
          }
        }
      } else {
        try {
          utils.updateBadge('funding', 'reset')
          localStorage.setItem('funding_proposal_count', 0)
        } catch (e) {
          // console.warn(e)
        }
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
.register-reminder {
  text-align: center;
  color: #ff6c00;
  margin-bottom: 15px;
}
.register-reminder a {
  text-decoration: underline;
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
  max-width: 400px;
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
