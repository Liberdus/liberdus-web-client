<template>
  <div>
    <p style="display: none">
      {{ isUIReady }}
    </p>
    <div
      v-if="isUIReady"
      class="home-tab-container"
    >
      <v-ons-list id="transaction-list">
        <v-ons-list-item
          v-for="transaction in transactions"
          :key="transaction.type + transaction.amount + transaction.timestamp"
        >
          <transaction-list-item :transaction="transaction" />
        </v-ons-list-item>
      </v-ons-list>
    </div>
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
      isUIReady: 'chat/isUIReady',
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
    // this.refreshAppState()
    // if (!this.getTimers['appRefresher']) {
    //   const appRefresher = setInterval(this.refreshAppState, 10000)
    //   this.addTimer({ key: 'appRefresher', value: appRefresher })
    // }
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
      updateCompletedDevProposals: 'proposal/updateCompletedDevProposals',
      addTimer: 'chat/addTimer'
    }),
    getLastTxFromAPI () {
      if (!this.getAppState) return
      let txs = this.getAppState.data.transactions
      return txs[txs.length - 1]
    },
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
