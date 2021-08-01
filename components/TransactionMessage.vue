<template>
  <section class="type-plus-address">
    <div v-if="transaction.type === 'receive'" class="transaction-type">
      Received Coins From
    </div>
    <div v-else-if="transaction.type === 'send'" class="transaction-type">
      Sent Coins To
    </div>
    <div v-else-if="transaction.type === 'stake'" class="transaction-type">
      Add Stake To
    </div>
    <div v-else-if="transaction.type === 'remove_stake'" class="transaction-type">
      Remove Stake From
    </div>
    <div v-else-if="transaction.type === 'node_reward'" class="transaction-type">
      Received Reward From
    </div>
    <div v-else-if="transaction.type === 'send_message'" class="transaction-type">
      Sent Message To
    </div>
    <div v-else-if="transaction.type === 'receive_message'" class="transaction-type">
      Receive Message From
    </div>
    <div v-else-if="transaction.type === 'register'" class="transaction-type">
      Register As
    </div>
    <div v-else-if="transaction.type === 'proposal'" class="transaction-type">
      Submit Proposal
    </div>
    <div v-else-if="transaction.type === 'dev_proposal'" class="transaction-type">
      Submit Funding Proposal
    </div>
    <div v-else-if="transaction.type === 'vote'" class="transaction-type">
      Vote Network Parameter
    </div>
    <div v-else-if="transaction.type === 'dev_vote'" class="transaction-type">
      Vote Development Funding
    </div>
    <div v-else-if="transaction.type === 'developer_payment'" class="transaction-type">
      Received Funding
    </div>

    <div>
      <p v-if="transaction.type === 'register'" class="other-person-address">@{{ transaction.alias }}</p>
      <p v-else-if="otherPersonHandle" class="other-person-address">@{{ otherPersonHandle }}</p>
      <p v-else class="other-person-address">
        {{ transaction.otherPersonAddress }}
      </p>
    </div>
  </section>
</template>

<script>
import moment from 'moment';
import utils from '../assets/utils';
import { mapActions, mapGetters } from 'vuex';

export default {
  props: ['transaction'],
  data: function() {
    return {
      otherPersonHandle: null,
    };
  },
  computed: {
    ...mapGetters({
      getHandleDictionary: 'chat/getHandleDictionary',
    }),
    timestamp() {
      return moment(this.transaction.timestamp).calendar();
    },
  },
  async mounted() {
    if (this.transaction) {
      if (this.getHandleDictionary[this.transaction.otherPersonAddress]) {
        this.otherPersonHandle = this.getHandleDictionary[this.transaction.otherPersonAddress];
      } else {
        this.otherPersonHandle = await utils.getHandle(this.transaction.otherPersonAddress);
        this.addHandle({
          address: this.transaction.otherPersonAddress,
          handle: this.otherPersonHandle,
        });
      }
    }
  },
  methods: {
    ...mapActions({
      addHandle: 'chat/addHandle',
    }),
  },
};
</script>
