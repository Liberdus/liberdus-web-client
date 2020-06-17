<template>
  <section>
    <div
      v-if="transaction.type === 'receive'"
      class="transaction-amount receive-amount"
    >
      + {{ transaction.amount.toFixed(3) }}
    </div>
    <div
      v-else-if="transaction.type === 'send'"
      class="transaction-amount send-amount"
    >
      - {{ transaction.amount + (transaction.fee || 0.001) }}
    </div>
    <div
      v-else-if="transaction.type === 'stake'"
      class="transaction-amount send-amount"
    >
      - {{ transaction.amount }}
    </div>
    <div
      v-else-if="transaction.type === 'remove_stake'"
      class="transaction-amount receive-amount"
    >
      + {{ transaction.amount }}
    </div>
    <div
      v-else-if="transaction.type === 'node_reward'"
      class="transaction-amount receive-amount"
    >
      + {{ transaction.amount }}
    </div>
    <div
      v-else-if="transaction.type === 'send_message'"
      class="transaction-amount send-amount"
    >
      - {{ transaction.amount + (transaction.fee || 0.001) }}
    </div>
    <div
      v-else-if="transaction.type === 'receive_message'"
      class="transaction-amount receive-amount"
    >
      + {{ transaction.amount.toFixed(3) }}
    </div>
    <div
      v-else-if="transaction.type === 'register'"
      class="transaction-amount send-amount"
    >
      - {{ transaction.amount.toFixed(3) }}
    </div>
    <div
      v-else-if="
        transaction.type === 'proposal' ||
          transaction.type === 'dev_proposal' ||
          transaction.type === 'vote' ||
          transaction.type === 'dev_vote'
      "
      class="transaction-amount send-amount"
    >
      - {{ transaction.amount + (transaction.fee || 0.001) }}
    </div>
    <div
      v-else-if="transaction.type === 'developer_payment'"
      class="transaction-amount receive-amount"
    >
      + {{ transaction.amount }}
    </div>
  </section>
</template>
<script>
import moment from 'moment'
import utils from '../assets/utils'
export default {
  props: ['transaction']
}
</script>
