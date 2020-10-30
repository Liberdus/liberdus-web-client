<template>
  <section class="type-plus-address">
    <div v-if="transaction.type === 'receive'" class="transaction-type">
      Received coins from
    </div>
    <div v-else-if="transaction.type === 'send'" class="transaction-type">
      Sent coins to
    </div>
    <div v-else-if="transaction.type === 'stake'" class="transaction-type">
      Add stake to
    </div>
    <div
      v-else-if="transaction.type === 'remove_stake'"
      class="transaction-type"
    >
      Remove stake from
    </div>
    <div
      v-else-if="transaction.type === 'node_reward'"
      class="transaction-type"
    >
      Received reward from
    </div>
    <div
      v-else-if="transaction.type === 'send_message'"
      class="transaction-type"
    >
      Sent message to
    </div>
    <div
      v-else-if="transaction.type === 'receive_message'"
      class="transaction-type"
    >
      Receive message from
    </div>
    <div v-else-if="transaction.type === 'register'" class="transaction-type">
      Register as
    </div>
    <div v-else-if="transaction.type === 'proposal'" class="transaction-type">
      Submit proposal
    </div>
    <div
      v-else-if="transaction.type === 'dev_proposal'"
      class="transaction-type"
    >
      Submit funding proposal
    </div>
    <div v-else-if="transaction.type === 'vote'" class="transaction-type">
      Vote network parameter
    </div>
    <div v-else-if="transaction.type === 'dev_vote'" class="transaction-type">
      Vote development funding
    </div>
    <div
      v-else-if="transaction.type === 'developer_payment'"
      class="transaction-type"
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
        loading...
      </p>
    </div>
  </section>
</template>

<script>
import moment from 'moment'
import utils from '../assets/utils'
import { mapActions, mapGetters } from 'vuex'

export default {
  props: ['transaction'],
  data: function () {
    return {
      otherPersonHandle: null
    }
  },
  computed: {
    ...mapGetters({
      getHandleDictionary: 'chat/getHandleDictionary'
    }),
    timestamp () {
      return moment(this.transaction.timestamp).calendar()
    }
  },
  async mounted () {
    if (this.transaction) {
      console.log('\n\n === mounted: \n\n', this.transaction.otherPersonAddress)

      if (this.getHandleDictionary[this.transaction.otherPersonAddress]) {
        this.otherPersonHandle = this.getHandleDictionary[
          this.transaction.otherPersonAddress
        ]
      } else {
        this.otherPersonHandle = await utils.getHandle(
          this.transaction.otherPersonAddress
        )
        this.addHandle({
          address: this.transaction.otherPersonAddress,
          handle: this.otherPersonHandle
        })
      }

      console.log('\n\n === mounted1: \n\n', this.otherPersonHandle)
    }
  },
  methods: {
    ...mapActions({
      addHandle: 'chat/addHandle'
    })
  }
}
</script>
