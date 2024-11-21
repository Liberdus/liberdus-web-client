<template>
  <!-- <v-ons-page> -->
  <div>
    <!-- <tool-bar :option="{ menu: false, notification: false, back: true }" /> -->

    <div class="toll-container">
      <portal to="navigation-tags">
        <a-breadcrumb>
          <a-breadcrumb-item>Stake</a-breadcrumb-item>
        </a-breadcrumb>
      </portal>

      <a-card title="Manage Your Stake" class="stake-card">
        <p v-if="stakeRequired" class="stake-required">
            Minimum Stake Required: <strong>{{ stakeRequired }} coins</strong>
        </p>
        <!-- Current Stake Details -->
        <div class="current-stake">
          <a-statistic
            class="stake-amount"
            v-if="currentStakedNominee"
            title="Current Staked Amount"
            :value="Number(currentStakedAmount)"
            suffix="coins"
          />
          <a-statistic
          class="stake-amount"
          v-else
          title="Current Staked Amount"
          :value="'--'"
        />

        <a-statistic
          class="stake-nominee"
          v-if="currentStakedNominee"
          title="Nominee Address"
          :value="currentStakedNominee"
          valueStyle="margin-bottom: 20px; font-size: small;"
        />

        </div>

        <!-- Force Unstake Toggle -->
        <div class="toggle-container" v-if="currentStakedAmount">
          <a-switch
            v-model="forceUnstake"
            checkedChildren="Force Unstake"
            unCheckedChildren="Normal Unstake"
          />
          <p class="toggle-label">Force Unstake: {{ forceUnstake ? 'Enabled' : 'Disabled' }}</p>
        </div>

        <!-- Withdraw Stake Button -->
        <div class="button-container withdraw-container" v-if="currentStakedAmount">
          <form
            @submit.prevent="onSubmitWithdrawStake"
          >
            <a-button
              htmlType="submit"
              type="danger"
              shape="round"
              size="large"
              class="action-button"
            >
              Withdraw Stake
            </a-button>
          </form>
        </div>

        <!-- Divider Line -->
        <div class="divider" v-if="currentStakedAmount"></div>

        <!-- Stake Amount Input and Add More Stake Button -->
        <div class="input-container">
          <a-input
            v-model="stake"
            placeholder="Enter Stake Amount"
            type="number"
            min="1"
            max="1000"
            class="input-field"
          />

          <a-input
            v-if="!currentStakedNominee"
            v-model="nominee"
            placeholder="Enter Nominee Address"
            type="text"
            class="input-field"
          />

          

          <form
            class="button-form"
            @submit.prevent="onSubmitDepositStake"
          >
            <a-button
              htmlType="submit"
              type="primary"
              shape="round"
              size="large"
              class="action-button"
            >
              {{ this.currentStakedNominee ? 'Add More Stake' : 'Deposit Stake' }}
            </a-button>
          </form>
        </div>
      </a-card>
    </div>
  </div>
</template>



<script>
import Vue from 'vue';
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import VueOnsen from 'vue-onsenui/esm';
import OnsenComponents from '~/components/Onsen';
import ChatText from '~/components/ChatText';
import ChatInput from '~/components/ChatInput';
import { mapGetters } from 'vuex';
import moment from 'moment';
import utils from '../../assets/utils';
import ToolBar from '~/components/ToolBar';
import Title from '~/components/baisc/Title';
import Button from '~/components/baisc/Button';

import Vuelidate from 'vuelidate';
import { required, minLength, between } from 'vuelidate/lib/validators';
Vue.use(VueOnsen);
Vue.use(Vuelidate);
Object.values(OnsenComponents).forEach((c) => Vue.component(c.name, c));

export default {
  components: {
    Title,
    Button,
    ToolBar,
  },
  layout: 'dashboard',
  data: function() {
    return {
      network: null,
      amount: '',
      stakeRequired: null,
      stake: '10', // New input for stake
      nominee: '', // New input for nominee
      forceUnstake: false,
    };
  },
  validations: {
    amount: {
      required,
      between: between(1, 1000),
    },
  },
  computed: {
  ...mapGetters({
    getWallet: 'wallet/getWallet',
    getAppState: 'chat/getAppState',
    isUIReady: 'chat/isUIReady',
  }),
  currentStakedAmount() {
    return this.getAppState?.operatorAccountInfo?.stake || 0;
  },
  currentStakedNominee() {
    return this.getAppState?.operatorAccountInfo?.nominee || '';
  },
  stakeTimestamp() {
    return this.getAppState?.operatorAccountInfo?.stakeTimestamp || null;
  },
  formattedStakeTimestamp() {
    return this.stakeTimestamp
      ? moment(this.stakeTimestamp).format('MMMM Do YYYY, h:mm:ss a')
      : '--';
  },
},
  mounted: async function() {
    let network = await utils.queryParameters();
    console.log(network);
    this.network = network;

    this.stakeRequired = network.current.stakeRequiredUsd;
    this.nominee = this.getAppState?.operatorAccountInfo?.nominee || '';
  },
  methods: {
    //   async onSubmitStake() {
    //     let isSubmitted = await utils.addStake(
    //       this.stakeRequired,
    //       this.getWallet.entry.keys
    //     );
    //     if (isSubmitted) {
    //       this.amount = '';
    //       this.notify('Your transaction is submitted to network.');
    //     }
    //   },
    // async onSubmitRemoveStake() {
    //   let isSubmitted = await utils.removeStake(
    //     this.stakeRequired,
    //     this.getWallet.entry.keys
    //   );
    //   if (isSubmitted) {
    //     this.amount = '';
    //     this.notify('Your transaction is submitted to network.');
    //   }
    // },
    //   async onSubmitRequestRemoveStake() {
    //     let isSubmitted = await utils.requestRemoveStake(
    //       this.stakeRequired,
    //       this.getWallet.entry.keys
    //     );
    //     if (isSubmitted) {
    //       this.amount = '';
    //       this.notify('Your transaction is submitted to network.');
    //     }
    //   },
    async onSubmitDepositStake() {
      if (!this.stake || (!this.nominee && !this.currentStakedNominee)) {
        this.notify('Please enter both Stake and Nominee values.');
        return;
      }
      const isSubmitted = await utils.depositStake(
        this.nominee || this.currentStakedNominee,
        this.stake,
        this.getWallet.entry.keys
      );
      if (isSubmitted) {
        this.stake = '';
        this.nominee = '';
        this.notify('Your deposit transaction is submitted to the network.');
      }
    },
    async onSubmitWithdrawStake() {
      if (!this.currentStakedNominee) {
        this.notify('You dont have any stake to withdraw yet.');
        return;
      }
      const isSubmitted = await utils.withdrawStake(
        this.currentStakedNominee,
        this.forceUnstake,
        this.getWallet.entry.keys
      );
      if (isSubmitted) {
        this.stake = '';
        this.notify('Your withdraw transaction is submitted to the network.');
      }
    },
    redirect(url, option) {
      this.$router.push(url);
      if (url === '/' && option) {
      }
    },
    notify(message) {
      this.$ons.notification.alert(message);
    },
  },
};
</script>

<style lang="scss">
.toll-container {
  width: 90%;
  max-width: 600px;
  margin: 20px auto;
  text-align: center;
}

.stake-card {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 20px 0 20px 0;
}

.current-stake {
  margin-bottom: 20px;
}

.stake-required {
  color: #555;
  font-size: 0.9em;
  margin: 5px 0;
}

.placeholder-text {
  color: #999;
  font-size: 0.85em;
}

.toggle-container {
  margin: 20px 0;
}

.toggle-label {
  margin-top: 5px;
  font-size: 0.85em;
  color: #555;
}

/* Add this style to target the switch element specifically */
.a-switch {
  width: fit-content; /* Allow switch to adjust to its content */
}
.withdraw-container {
  margin-top: 15px;
  text-align: center;
}

.divider {
  height: 1px;
  background-color: #ddd;
  margin: 20px 0;
}

.input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-field {
  width: 100%;
  margin-bottom: 20px;
}

.button-form {
  text-align: center;
}

.action-button {
  font-size: 1em;
}
</style>
