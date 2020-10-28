<template>
  <div>
    <p style="display: none">
      {{ isUIReady }}
    </p>
    <div v-if="isUIReady">
      <!-- <v-ons-list id="transaction-list">
        <v-ons-list-item
          v-for="transaction in transactions"
          :key="transaction.type + transaction.amount + transaction.timestamp"
        >
          <transaction-list-item :transaction="transaction" />
        </v-ons-list-item>
      </v-ons-list> -->
      <div style="justify-content:flex-end; display:flex;">
        <a-button type="primary" @click="downloadJSONFile"
          >Download Transactions JSON</a-button
        >
      </div>
      <a-table :columns="columns" :data-source="txs">
        <span slot="txId" slot-scope="text">
          <span class="history-tx-id">
            {{ text }}
          </span>
        </span>
        <!-- <span slot="timestamp" slot-scope="text">
          {{ moment(text).calendar() }}
        </span> -->
      </a-table>
    </div>
  </div>
</template>

<script>
import TransactionListItem from '~/components/TransactionListItem';
import { mapGetters, mapActions } from 'vuex';
import { map, filter, concat, flow, chain } from 'lodash';
import * as _ from 'lodash';
import utils from '../assets/utils';
import ToolBar from '~/components/ToolBar';
import Title from '~/components/baisc/Title';
import Button from '~/components/baisc/Button';
import Notification from '~/components/Notification';
import moment from 'moment';
export default {
  components: {
    TransactionListItem,
    ToolBar,
    Title,
    Button,
    Notification,
  },
  data: function() {
    const columns = [
      {
        title: 'TxID',
        dataIndex: 'txId',
        key: 'txId',
        slots: { title: 'customTitle' },
        scopedSlots: { customRender: 'txId' },
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: 'Time',
        dataIndex: 'timestamp_str',
        key: 'timestamp_str',
        // customRender: (text, row, index) => {
        //   return {
        //     children: moment(row.timestamp).calendar()
        //   }
        // }
      },
      {
        title: 'From',
        dataIndex: 'from',
        key: 'from',
      },
      {
        title: 'To',
        dataIndex: 'to',
        key: 'to',
      },
    ];

    return {
      lastMessage: null,
      lastTx: null,
      previousUrl: null,
      txs: [],
      columns,
    };
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      getNetwork: 'chat/getNetwork',
      isUIReady: 'chat/isUIReady',
    }),
    transactions() {
      // if (!this.getWallet || !this.getAppState) return []
      // let myAddress = this.getWallet.entry.address
      // let txs = this.getAppState.data.transactions
      // console.log('\n\n === Transactions: == \n\n', txs)

      return utils.sortByTimestamp(this.txs, 'desc');
    },
  },
  mounted: async function() {
    // this.refreshAppState()
    // if (!this.getTimers['appRefresher']) {
    //   const appRefresher = setInterval(this.refreshAppState, 10000)
    //   this.addTimer({ key: 'appRefresher', value: appRefresher })
    // }
    let txs = this.getAppState.data.transactions;

    this.txs = await Promise.all(
      txs.map(async (tx) => {
        const { txId, type, timestamp, from, to } = tx;
        const strFirst = txId.substring(0, 3);
        const strLast = txId.substr(txId.length - 3);

        console.log('\n\n === here === \n\n', from, to);
        const from_handle = from ? await utils.getHandle(from) : '';
        const to_handle = to ? await utils.getHandle(to) : '';
        console.log('\n\n === here1 === \n\n', from_handle, to_handle);

        return {
          txId: `${strFirst}...${strLast}`,
          type,
          timestamp,
          timestamp_str: moment(timestamp).calendar(),
          from: from_handle,
          to: to_handle,
        };
      })
    );
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
      addTimer: 'chat/addTimer',
    }),
    getLastTxFromAPI() {
      if (!this.getAppState) return;
      let txs = this.getAppState.data.transactions;
      return txs[txs.length - 1];
    },
    downloadJSONFile() {
      let txs = this.getAppState.data.transactions;
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(txs)], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = 'transactions.json';
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    },
  },
};
</script>

<style>
.history-tx-id {
  max-width: 190px;
  display: block;
}
</style>
