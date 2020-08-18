<template>
  <div class="chat-input-container">
    <p
      class="required-toll not-enough-toll"
      v-if="!isFriend && notEnoughCoin"
    >Not Enough coin to pay toll</p>
    <p class="required-toll" v-else-if="!isFriend">
      <strong>Total Cost: {{ requiredToll + requiredFee}} coins</strong>
      (Toll {{ requiredToll }} coins + Tx fee {{ requiredFee }} coins)
    </p>
    <p class="required-toll" v-else-if="isFriend">
      <strong>Total Cost: {{ requiredFee}} coins</strong>
      (Tx Fee)
    </p>
    <input
      type="text"
      placeholder="Type your message"
      v-model="message"
      class="text-input chat-input"
      v-on:keyup.enter="submitMessage"
      :disabled="notEnoughCoin"
    />
  </div>
</template>

<script>
import utils from "../assets/utils";
import { mapGetters } from "vuex";
export default {
  props: ["friend", "isFriend", "setPendingMessage"],
  data: function() {
    return {
      message: "",
      requiredToll: null,
      requiredFee: 0.0
    };
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState"
    }),
    notEnoughCoin() {
      // if (this.getAppState.data.balance < parseFloat(this.requiredToll))
      //   return true;
      // return false;
      return false;
    }
  },
  methods: {
    async submitMessage() {
      let messageToSend = this.message;
      this.message = "";
      let myWallet = this.getWallet;
      let isSubmitted = await utils.sendMessage(
        messageToSend,
        myWallet,
        this.friend
      );
      this.setPendingMessage({
        handle: this.getWallet.handle,
        timestamp: null,
        body: messageToSend
      });
    }
  },
  async mounted() {
    const to = await utils.getAddress(this.friend);
    this.requiredToll = await utils.getToll(to, this.getWallet.entry.address);
    const network = await utils.queryParameters();
    if (network.current.transactionFee) {
      this.requiredFee = network.current.transactionFee;
    }
  }
};
</script>

<style>
.chat-input-container {
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: fixed;
  top: calc(100% - 80px);
  z-index: 100;
  background: #efefef;
  box-shadow: 0 -2px 4px 0 rgba(206, 206, 206, 0.5);
}
.text-input.chat-input {
  height: 40px;
  width: 90%;
  max-width: 600px;
  padding: 5px 15px;
  font-size: 14px;
}
.chat-input-container .required-toll {
  text-align: left;
  width: 90%;
  margin-bottom: 5px;
  padding-left: 5px;
  color: #d79341;
  max-width: 600px;
  top: 10px;
  position: relative;
}
.chat-input-container .required-toll.not-enough-toll {
  color: red;
}
input[type="text"],
input[type="number"],
textarea {
  font-size: 16px !important;
}
</style>
