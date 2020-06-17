<template>
  <section class="type-plus-address">
    <div class="transaction-type" v-if="transaction.type === 'receive'">
      Received coins from
    </div>
    <div class="transaction-type" v-else-if="transaction.type === 'send'">
      Sent coins to
    </div>
    <div class="transaction-type" v-else-if="transaction.type === 'stake'">
      Add stake to
    </div>
    <div
      class="transaction-type"
      v-else-if="transaction.type === 'remove_stake'"
    >
      Remove stake from
    </div>
    <div
      class="transaction-type"
      v-else-if="transaction.type === 'node_reward'"
    >
      Received reward from
    </div>
    <div
      class="transaction-type"
      v-else-if="transaction.type === 'send_message'"
    >
      Sent message to
    </div>
    <div
      class="transaction-type"
      v-else-if="transaction.type === 'receive_message'"
    >
      Receive message from
    </div>
    <div class="transaction-type" v-else-if="transaction.type === 'register'">
      Register as
    </div>
    <div class="transaction-type" v-else-if="transaction.type === 'proposal'">
      Submit proposal
    </div>
    <div
      class="transaction-type"
      v-else-if="transaction.type === 'dev_proposal'"
    >
      Submit funding proposal
    </div>
    <div class="transaction-type" v-else-if="transaction.type === 'vote'">
      Vote network parameter
    </div>
    <div class="transaction-type" v-else-if="transaction.type === 'dev_vote'">
      Vote development funding
    </div>
    <div
      class="transaction-type"
      v-else-if="transaction.type === 'developer_payment'"
    >
      Received funding
    </div>

    <div>
      <p v-if="transaction.type === 'register'" class="other-person-address">
        @{{ transaction.alias }}
      </p>
      <p v-else-if="otherPersonHandle" class="other-person-address">
        @{{ otherPersonHandle }}
      </p>
      <p v-else class="other-person-address">
        {{ transaction.otherPersonAddress }}
      </p>
    </div>
  </section>
</template>

<script>
import moment from 'moment'
import utils from '../assets/utils'
export default {
  props: ['transaction'],
  data: function () {
    return {
      otherPersonHandle: null
    }
  },
  computed: {
    timestamp () {
      return moment(this.transaction.timestamp).calendar()
    }
  },
  async mounted () {
    if (this.transaction) {
      this.otherPersonHandle = await utils.getHandle(
        this.transaction.otherPersonAddress
      )
    }
  }
}
</script>
