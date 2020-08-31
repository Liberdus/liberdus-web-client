<template>
  <!-- <v-ons-page> -->
  <div>
    <!-- <tool-bar :option="{ menu: false, notification: false, back: true }" /> -->

    <div class="toll-container">
      <p v-if="getAppState">
        Current Staked Amount:
        <strong>{{ currentStakedAmount }} Coins</strong><span v-if="pendingStakeRemoval"> (pending for removal)</span>
      </p>
      <p v-else>
        Current Staked Amount: -
      </p>
      <p v-if="stakeRequired">
        Required Stake: <strong>{{ stakeRequired }} coins</strong>
      </p>
      <form
        v-if="currentStakedAmount === 0 && stakeRequired > 0"
        class="toll-form"
        @submit.prevent="onSubmitStake"
      >
        <Button text="Add Stake" />
      </form>
      <form
        v-if="currentStakedAmount > 0 && !pendingStakeRemoval"
        class="toll-form"
        @submit.prevent="onSubmitRequestRemoveStake"
      >
        <Button
          v-if="!pendingStakeRemoval"
          text="Request to remove stake"
        />
      </form>
      <form
        v-if="currentStakedAmount > 0 && pendingStakeRemoval"
        class="toll-form"
        @submit.prevent="onSubmitRemoveStake"
      >
        <div v-if="pendingStakeRemoval">
          <Button
            text="Remove stake"
            :is-disabled="!isReadyToRemoveStake"
          />
          <p style="font-size: 13px">
            Your stake can be removed at
            <strong v-if="timeToRemoveStake">{{ timeToRemoveStake }}</strong>
          </p>
        </div>
      </form>
    </div>
  <!-- </v-ons-page> -->
  </div>
</template>

<script>
import Vue from 'vue'
import 'onsenui/css/onsenui.css'
import 'onsenui/css/onsen-css-components.css'
import VueOnsen from 'vue-onsenui/esm'
import OnsenComponents from '~/components/Onsen'
import ChatText from '~/components/ChatText'
import ChatInput from '~/components/ChatInput'
import { mapGetters } from 'vuex'
import moment from 'moment'
import utils from '../../assets/utils'
import ToolBar from '~/components/ToolBar'
import Title from '~/components/baisc/Title'
import Button from '~/components/baisc/Button'

import Vuelidate from 'vuelidate'
import { required, minLength, between } from 'vuelidate/lib/validators'
Vue.use(VueOnsen)
Vue.use(Vuelidate)
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c))

export default {
  components: {
    Title,
    Button,
    ToolBar
  },
  layout: 'dashboard',
  data: function () {
    return {
      network: null,
      amount: '',
      stakeRequired: null
    }
  },
  validations: {
    amount: {
      required,
      between: between(1, 1000)
    }
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      isUIReady: 'chat/isUIReady'
    }),
    isStakeValid () {
      if (this.$v.amount.required && this.$v.amount.between) return true
    },
    currentStakedAmount () {
      if (this.getAppState) return this.getAppState.data.stake || 0
      else return 0
    },
    pendingStakeRemoval () {
      if (this.getAppState)
        return this.getAppState.data.remove_stake_request !== null
      else false
    },
    timestampToRemoveStake () {
      if (this.pendingStakeRemoval && this.network) {
        let nodeRewardInterval = this.network.current.nodeRewardInterval
        return (
          this.getAppState.data.remove_stake_request + 2 * nodeRewardInterval
        )
      }
    },
    timeToRemoveStake () {
      if (this.timestampToRemoveStake) {
        return moment(this.timestampToRemoveStake).format(
          'MMMM Do YYYY, h:mm:ss a'
        )
      }
    },
    isReadyToRemoveStake () {
      if (this.timestampToRemoveStake) {
        return Date.now() >= this.timestampToRemoveStake
      }
    }
  },
  mounted: async function () {
    let network = await utils.queryParameters()
    console.log(network)
    this.network = network

    this.stakeRequired = network.current.stakeRequired
  },
  methods: {
    async onSubmitStake () {
      let isSubmitted = await utils.addStake(
        this.stakeRequired,
        this.getWallet.entry.keys
      )
      if (isSubmitted) {
        this.amount = ''
        this.notify('Your transaction is submitted to network.')
      }
    },
    async onSubmitRemoveStake () {
      let isSubmitted = await utils.removeStake(
        this.stakeRequired,
        this.getWallet.entry.keys
      )
      if (isSubmitted) {
        this.amount = ''
        this.notify('Your transaction is submitted to network.')
      }
    },
    async onSubmitRequestRemoveStake () {
      let isSubmitted = await utils.requestRemoveStake(
        this.stakeRequired,
        this.getWallet.entry.keys
      )
      if (isSubmitted) {
        this.amount = ''
        this.notify('Your transaction is submitted to network.')
      }
    },
    redirect (url, option) {
      this.$router.push(url)
      if (url === '/' && option) {
      }
    },
    notify (message) {
      this.$ons.notification.alert(message)
    }
  }
}
</script>

<style lang="scss">
.toll-container {
  width: 90%;
  max-width: 600px;
  margin: 20px auto;
  text-align: center;
  p {
    text-align: left;
    margin-bottom: 10px;
    font-family: Poppins;
    font-size: 14px;
    color: #333333;
    letter-spacing: -0.16px;
    text-align: left;
  }
}
.toll-form .input-error-message {
  text-align: left;
  color: red;
}
.toll-amount-input-container {
  height: 80px;
  margin-bottom: 20px;
}
</style>
