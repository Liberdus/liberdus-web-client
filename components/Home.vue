<template>
  <v-ons-page>
    <!-- {{ getAppState }} -->
    <!-- <div v-if="!getAppState">Loading...</div> -->
    <!-- <div class="home-tab-container" v-else> -->
    <tool-bar :option="{ menu: true, notification: true, back: false}" />
    <div class="home-tab-container">
      <!-- {{ getAppState }} -->
      <div class="total-balance">
        <h1 v-if="getAppState && getAppState.data.balance">
          {{ getAppState.data.balance.toFixed(3) }}
          <span class="total-unit">LBD</span>
        </h1>
        <h1 v-else>
          12,000
          <span class="total-unit">LBD</span>
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
      <v-ons-list>
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
import TransactionListItem from "~/components/TransactionListItem";
import { mapGetters, mapActions } from "vuex";
import utils from "../assets/utils";
import ToolBar from "~/components/ToolBar";
import Title from "~/components/baisc/Title";
import Button from "~/components/baisc/Button";
export default {
  components: {
    TransactionListItem,
    ToolBar,
    Title,
    Button
  },
  data: function() {
    return {};
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState",
      getLastMessage: "chat/getLastMessage",
      getLastTx: "chat/getLastTx",
      isUIReady: "chat/isUIReady",
      getActiveProposals: "proposal/getActiveProposals",
      getCompletedProposals: "proposal/getCompletedProposals",
      getActiveDevProposals: "proposal/getActiveDevProposals",
      getCompletedDevProposals: "proposal/getCompletedDevProposals"
    }),
    transactions() {
      if (!this.getWallet || !this.getAppState) return [];
      let myAddress = this.getWallet.entry.address;
      let txs = this.getAppState.data.transactions;
      return txs
        .filter(tx => tx.type === "transfer")
        .map(tx => {
          let type;
          let otherPersonAddress;
          if (tx.type === "transfer") {
            if (tx.from == myAddress && tx.to == myAddress) type = "self";
            else if (tx.from == myAddress) {
              type = "send";
              otherPersonAddress = tx.to;
            } else if (tx.to == myAddress) {
              type = "receive";
              otherPersonAddress = tx.from;
            } else type = "claim";
          } else {
            type = tx.type;
          }
          return {
            type,
            otherPersonAddress,
            timestamp: tx.timestamp,
            amount: tx.amount
          };
        });
    }
  },
  mounted: function() {
    this.refreshAppState();
  },
  methods: {
    ...mapActions({
      updateAppState: "chat/updateAppState",
      updateLastMessage: "chat/updateLastMessage",
      updateLastTx: "chat/updateLastTx",
      setUIReady: "chat/setUIReady",
      updateActiveProposals: "proposal/updateActiveProposals",
      updateCompletedProposals: "proposal/updateCompletedProposals",
      updateActiveDevProposals: "proposal/updateActiveDevProposals",
      updateCompletedDevProposals: "proposal/updateCompletedDevProposals"
    }),
    getLastTxFromAPI() {
      if (!this.getAppState) return;
      let txs = this.getAppState.data.transactions;
      return txs[txs.length - 1];
    },
    getNewLastMessage() {
      if (this.messageList && this.messageList.length > 0) {
        let sortedMessageList = this.messageList.sort(
          (a, b) => b.timestamp - a.timestamp
        );
        return {
          newLastMessage: sortedMessageList[0].lastMessage,
          latestTimestamp: sortedMessageList[0].timestamp,
          handle: sortedMessageList[0].handle
        };
      } else
        return {
          newLastMessage: null,
          latestTimestamp: null,
          handle: null
        };
    },
    processTx(tx) {
      let myAddress = this.getWallet.entry.address;
      let type;
      let otherPersonAddress;
      if (tx.type === "transfer") {
        if (tx.srcAcc == myAddress && tx.tgt == myAddress) type = "self";
        else if (tx.srcAcc == myAddress) {
          type = "send";
          otherPersonAddress = tx.tgtAcc;
        } else if (tx.tgtAcc == myAddress) {
          type = "receive";
          otherPersonAddress = tx.srcAcc;
        } else type = "claim";
      } else {
        type = tx.type;
      }
      return {
        type,
        otherPersonAddress,
        timestamp: tx.timestamp,
        amount: tx.amount
      };
    },
    notifyNewMessage(handle, message) {
      this.$notify({
        group: "new-message",
        title: `@${handle}`,
        text: message,
        duration: 8000
      });
    },
    async notifyNewTx(tx) {
      let titleString;
      let otherPersonHandle = await utils.getHandle(tx.otherPersonAddress);
      if (tx.type === "receive") {
        titleString = `Receieved ${tx.amount} Coin from @${otherPersonHandle}`;
      } else if (tx.type === "send") {
        titleString = `Sent ${tx.amount} Coin to @${otherPersonHandle}`;
      }
      this.$notify({
        group: "new-message",
        title: `New Transaction`,
        text: titleString,
        duration: 8000
      });
    },
    async processData(myAccountData) {
      try {
        let { account } = myAccountData;
        let keys = Object.keys(account.data.chats);
        let modifiedChats = {};
        for (let i = 0; i < keys.length; i++) {
          let handle = await utils.getHandle(keys[i]);
          modifiedChats[handle] = account.data.chats[keys[i]];
        }
        let processed = { ...account };
        processed.data.chats = modifiedChats;
        for (var handle in processed.data.chats) {
          processed.data.chats[handle].messages = processed.data.chats[
            handle
          ].messages.map(m => JSON.parse(m));
        }
        let friendList = Object.values(processed.data.friends);
        friendList = friendList.filter(f => f !== null);
        processed.data.friends = friendList;
        return processed;
      } catch (e) {
        console.warn(`Unable to process account state data...`);
        console.log(myAccountData);
      }
    },
    async refreshAppState() {
      let self = this;
      if (self.getWallet && self.isUIReady) {
        console.log("Refreshing App state...");
        let myHandle = this.getWallet.handle;
        let myAccountData = await utils.queryAccount(myHandle);
        let processedState = await this.processData(myAccountData);
        self.updateAppState(processedState);
        let {
          newLastMessage,
          latestTimestamp,
          handle
        } = this.getNewLastMessage();
        // if (!newLastMessage) return;
        let isMessageRead = this.$route.name === "chathistory-friend";
        // if this is first-time loading
        if (newLastMessage && !this.getLastMessage) {
          this.updateLastMessage({ text: newLastMessage, read: isMessageRead });
        }
        let shouldNotifiyNewMessage =
          Math.abs(latestTimestamp - Date.now()) < 60000 &&
          this.getNewLastMessage &&
          this.getLastMessage.text !== newLastMessage;

        if (shouldNotifiyNewMessage) {
          this.updateLastMessage({ text: newLastMessage, read: isMessageRead });
          if (handle !== myHandle && !this.getLastMessage.read) {
            this.notifyNewMessage(handle, newLastMessage);
            utils.playSoundFile(newMessageSoundFile);
          }
        }
        let lastTxFromAPI = this.getLastTxFromAPI();
        if (lastTxFromAPI) {
          if (!this.getLastTx || this.getLastTx.txId !== lastTxFromAPI.txId) {
            if (lastTxFromAPI.timestamp < Date.now() - 30000) {
              lastTxFromAPI.seen = true;
              this.updateLastTx(lastTxFromAPI);
            } else {
              lastTxFromAPI.seen = false;
              this.updateLastTx(lastTxFromAPI);
            }
            if (!lastTxFromAPI.seen) {
              let processedTx = this.processTx(lastTxFromAPI);
              this.notifyNewTx(processedTx);
              utils.playSoundFile(newMessageSoundFile);
            }
          }
        }
        setTimeout(this.refreshAppState, 10000);
      } else {
        setTimeout(this.refreshAppState, 5000);
      }
    }
  }
};
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
