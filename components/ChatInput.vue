<template>
  <div class="chat-input-container">
    <a-row style="width: 100%" :gutter="16">
      <a-col :span="24" style="height: 30px;">
        <p
          v-if="!isFriend && notEnoughCoin"
          class="required-toll not-enough-toll"
        >
          Not Enough coin to pay toll
        </p>

        <p
          v-else-if="!isFriend"
          class="required-toll"
        >
          <strong>Total Cost: {{ requiredToll + requiredFee }} coins</strong>
          (Toll {{ requiredToll }} coins + Tx fee {{ requiredFee }} coins)
        </p>

        <p
          v-else-if="isFriend"
          class="required-toll"
        >
          <strong>Total Cost: {{ requiredFee }} coins</strong>
          (Tx Fee)
        </p>
      </a-col>

      <a-col :span="24">
        <a-row type="flex" :gutter="16">
          <a-col flex="auto">
            <a-input
              v-model="message"
              type="text"
              placeholder="Type your message"
              :disabled="notEnoughCoin"
              @keyup.enter="submitMessage"
              style="width: 100%"
            />
          </a-col>

          <a-col flex="40px">
            <a-button
              type="primary"
              @click="submitMessage"
              style="width: 100%"
            >
              Send
            </a-button>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import utils from '../assets/utils'
import { mapGetters } from 'vuex'
export default {
  props: ['friend', 'isFriend', 'setPendingMessage'],
  data: function () {
    return {
      message: '',
      requiredToll: null,
      requiredFee: 0.0
    }
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState'
    }),
    notEnoughCoin () {
      // if (this.getAppState.data.balance < parseFloat(this.requiredToll))
      //   return true;
      // return false;
      return false
    }
  },
  async mounted () {
    const to = await utils.getAddress(this.friend)
    this.requiredToll = await utils.getToll(to, this.getWallet.entry.address)
    const network = await utils.queryParameters()
    if (network.current.transactionFee) {
      this.requiredFee = network.current.transactionFee
    }
  },
  methods: {
    async submitMessage () {
      let messageToSend = this.message
      this.message = ''
      let myWallet = this.getWallet
      let isSubmitted = await utils.sendMessage(
        messageToSend,
        myWallet,
        this.friend
      )
      this.setPendingMessage({
        handle: this.getWallet.handle,
        timestamp: null,
        body: messageToSend
      })
    }
  }
}
</script>

<style>
.chat-input-container {
  height: 63px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: calc(100% - 200px);
  position: fixed;
  left: 200px;
  /* top: calc(100% - 50px); */
  bottom: 0px;
  z-index: 100;
  background: #efefef;
  box-shadow: 0 -2px 4px 0 rgba(206, 206, 206, 0.5);

  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 15px;
}
@media screen and (max-width: 992px) {
  .chat-input-container {
    left: 0px;
    width: 100%;
  }
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
  padding-left: 5px;
  padding-top: 10px;
  color: #d79341;
  max-width: 600px;
  position: relative;
}
.chat-input-container .required-toll.not-enough-toll {
  color: red;
}
input[type='text'],
input[type='number'],
textarea {
  font-size: 16px !important;
}
</style>
