<template>
  <div class="transaction-list-item">
    <div class="type-plus-address">
      <div class="transaction-type" v-if="transaction.type === 'receive'">Received from</div>
      <div class="transaction-type" v-else-if="transaction.type === 'send'">Sent to</div>
      <p class="other-person-address">{{ transaction.otherPersonAddress }}</p>
    </div>
    <div class="timestamp-plus-amount">
      <div class="timestamp">{{ timestamp }}</div>
      <div
        v-if="transaction.type === 'receive'"
        class="transaction-amount receive-amount"
      >+ {{ transaction.amount }}</div>
      <div
        v-else-if="transaction.type === 'send'"
        class="transaction-amount send-amount"
      >- {{ transaction.amount }}</div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import utils from "../assets/utils";
export default {
  props: ["transaction"],
  data: function() {
    return {
      otherPersonHandle: null
    };
  },
  computed: {
    timestamp() {
      return moment(this.transaction.timestamp).calendar();
    }
  },
  async mounted() {
    // if(this.transaction) this.otherPersonHandle = await utils.getHandle(this.transaction.otherPersonAddress)
  }
};
</script>

<style>
.transaction-list-item {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
}
.transaction-list-item .type-plus-address {
  width: 135px;
}
.transaction-list-item .timestamp-plus-amount {
  width: 50%;
  display: block;
  position: relative;
  text-align: right;
  padding-right: 15px;
}
.transaction-list-item .type-plus-address .transaction-type {
  font-family: Poppins;
  font-size: 12px;
  color: #9a9a9a;
  letter-spacing: -0.13px;
  text-align: left;
}
.transaction-list-item .timestamp {
  font-family: Poppins;
  font-size: 12px;
  color: #9a9a9a;
  letter-spacing: -0.13px;
  text-align: right;
}
.transaction-list-item .transaction-amount {
  font-weight: normal;
  font-size: 18px;
  margin-top: 10px;
}
.transaction-list-item .transaction-amount.receive-amount {
  font-family: Inconsolata;
  font-size: 20px;
  color: #3ec942;
  letter-spacing: -0.3px;
  text-align: right;
  line-height: 20px;
}
.transaction-list-item .transaction-amount.send-amount {
  font-family: Inconsolata;
  font-size: 20px;
  color: #ef764f;
  letter-spacing: -0.3px;
  text-align: right;
  line-height: 20px;
}
.transaction-list-item .transaction-amount.claim-amount {
  color: green;
}
.other-person-address {
  font-family: Inconsolata;
  font-size: 12px;
  color: #0a2463;
  letter-spacing: 0.24px;
  text-align: left;
  line-height: 18px;
  word-break: break-word;
  width: 200px;
}
.wallet-view-container .list-item {
  background: #ffffff;
  border: 1px solid #f6f6f6;
}
</style>
