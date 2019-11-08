<template>
  <v-ons-page>
    <!-- {{ getAppState.data.transactions }} -->
    <!-- <div v-if="!getAppState">Loading...</div> -->
    <!-- <div class="home-tab-container" v-else> -->
    <tool-bar :option="{ menu: true, notification: true, back: false}" />
    <div class="home-tab-container">
      <!-- {{ getAppState }} -->
      <div class="total-balance">
        <h1 v-if="getAppState">
          {{ getAppState.data.balance }}
          <span class="total-unit">LBD</span>
        </h1>
        <h1 v-else>
          12,000
          <span class="total-unit">LBD</span>
        </h1>
      </div>
      <div class="total-balance">
        <h4 v-if="getAppState">@{{ getWallet.handle }}</h4>
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
    return {
      transactions: [
        {
          type: "send",
          amount: 100,
          timestamp: Date.now(),
          otherPersonAddress: "0xab753d087318d0f26391b171cfc98a22f66fc95b"
        },
        {
          type: "receive",
          amount: 30,
          timestamp: Date.now(),
          otherPersonAddress: "0xab753d087318d0f26391b171cfc98a22f66fc95b"
        },
        {
          type: "send",
          amount: 20000,
          timestamp: Date.now(),
          otherPersonAddress: "0xab753d087318d0f26391b171cfc98a22f66fc95b"
        }
      ]
    };
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState",
      isUIReady: "chat/isUIReady"
    })
    // transactions() {
    //   if (!this.getWallet || !this.getAppState) return [];
    //   let myAddress = this.getWallet.entry.address;
    //   let txs = this.getAppState.data.transactions;
    //   return txs.map(tx => {
    //     let type;
    //     let otherPersonAddress;
    //     if (tx.type === "transfer") {
    //       if (tx.srcAcc == myAddress && tx.tgt == myAddress) type = "self";
    //       else if (tx.srcAcc == myAddress) {
    //         type = "send";
    //         otherPersonAddress = tx.tgtAcc;
    //       } else if (tx.tgtAcc == myAddress) {
    //         type = "receive";
    //         otherPersonAddress = tx.srcAcc;
    //       } else type = "claim";
    //     } else {
    //       type = tx.type;
    //     }
    //     return {
    //       type,
    //       otherPersonAddress,
    //       timestamp: tx.timestamp,
    //       amount: tx.amount
    //     };
    //   });
    // }
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
  font-family: Inconsolata-Regular;
  font-size: 42px;
  color: #2648d8;
  letter-spacing: 0;
  text-align: center;
  line-height: 42px;
  width: 200px;
  margin: 30px auto;
}
.total-balance h1 .total-unit {
  font-family: Poppins-Medium;
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
</style>
