<template>
  <!-- <v-ons-page> -->
  <div>
    <!-- <tool-bar :option="{ menu: false, notification: false, back: true }" /> -->
    <div class="send-coins-container">
      <portal to="navigation-tags">
        <a-breadcrumb>
          <a-breadcrumb-item>
            <nuxt-link to="/">Wallet</nuxt-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>Send</a-breadcrumb-item>
        </a-breadcrumb>
      </portal>

      <Title text="Send Coins" />

      <div v-if="loading" class="loading-status">
        <v-ons-progress-circular indeterminate />
      </div>

      <div v-else-if="!loading && !requiredTxFee" class="loading-status">
        Unable to get transaction fee from server
      </div>

      <div v-else>
        <p>
          Enter username
        </p>
        <q-reader :on-detect-q-r="onDetectUsername" :scanning="showScanner" />
        <v-ons-button v-if="showScanner" class="new-message-btn" modifier="quiet" @click="onClickQRScanner">
          Close QR Scanner
        </v-ons-button>
        <div class="send-username-input-container">
          <a-input
            ref="username-input"
            v-model="username"
            type="text"
            placeholder="Username"
            size="large"
            @focusout="checkUsername"
            @focusin="onUsernameFocus"
          />
          <a-button modifier="quiet" @click="onClickQRScanner" size="large" style="margin-left: 10px">
            <img src="../../assets/qrcode.png" alt="qr-code" />
          </a-button>
        </div>
        <div class="username-warning">
          <p v-if="isOwnName" class="invalid-username">
            You cannot send coins to yourself.
          </p>
          <p v-else-if="username.length > 0 && !hasUsernameFocus && !checkingUsername && !isUsernameExist" class="invalid-username">
            The username or address provided does not exist.
          </p>
          <p
            v-else-if="username.length > 0 && !hasUsernameFocus && !checkingUsername && isUsernameExist && targetInputType === 'username'"
            class="valid-username"
          >
            The username is valid.
          </p>
          <p
            v-else-if="username.length > 0 && !hasUsernameFocus && !checkingUsername && isUsernameExist && targetInputType === 'address'"
            class="valid-username"
          >
            The address is valid.
          </p>
        </div>
        <div class="send-amount-input-container">
          <p>
            Enter amount to send
          </p>
          <a-input v-model="amount" type="text" placeholder="Amount" size="large" />
          <p v-if="$v.amount.required && !$v.amount.between" class="input-error-message">
            Invalid amount
          </p>
          <p v-else-if="amount.length > 0 && !hasEnoughBalance" class="input-error-message">
            Not enough balance.
          </p>
        </div>
        <p class="required-tx-fee">Tx Fee {{ requiredTxFee }} coins will be deducted from your account.</p>
        <a-button @click="onSend" :disabled="!isFormValid" style="width: 100%" size="large" type="primary">
          Send
        </a-button>
      </div>
    </div>
    <!-- </v-ons-page> -->
  </div>
</template>

<script>
import Vue from 'vue';
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import VueOnsen from 'vue-onsenui/esm';
import PortalVue from 'portal-vue';
import OnsenComponents from '~/components/Onsen';
import ChatText from '~/components/ChatText';
import ChatInput from '~/components/ChatInput';
import QReader from '~/components/QReader';
import { mapGetters, mapActions } from 'vuex';
import utils from '../../assets/utils';
import Vuelidate from 'vuelidate';
import { required, minLength, between } from 'vuelidate/lib/validators';
import ToolBar from '~/components/ToolBar';
import Title from '~/components/basic/Title';
import Button from '~/components/basic/Button';
Vue.use(VueOnsen);
Vue.use(Vuelidate);
Vue.use(PortalVue);
Object.values(OnsenComponents).forEach((c) => Vue.component(c.name, c));

export default {
  components: {
    QReader,
    Title,
    Button,
    ToolBar,
  },
  layout: 'dashboard',
  data: function() {
    return {
      username: '',
      amount: '',
      previousUrl: '/',
      showScanner: false,
      isUsernameExist: true,
      checkingUsername: false,
      hasUsernameFocus: false,
      requiredTxFee: null,
      loading: true,
    };
  },
  validations: {
    username: {
      required,
      minLength: minLength(1),
    },
    amount: {
      required,
      between: between(1, 1000000000),
    },
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      isUIReady: 'chat/isUIReady',
    }),
    targetInputType() {
      if (this.username.length === 64) return 'address';
      else return 'username';
    },
    hasEnoughBalance() {
      const totalCost = parseFloat(this.amount) + parseFloat(this.requiredTxFee || 0.001);
      return this.getAppState.data.balance >= parseFloat(totalCost);
    },
    isOwnName() {
      if (this.username.toLowerCase() === this.getWallet.handle) return true;
      if (this.username.toLowerCase() === this.getWallet.entry.address) return true;
      else return false;
    },
    isFormValid() {
      if (
        !this.$v.username.required ||
        !this.$v.amount.required ||
        !this.$v.amount.between ||
        !this.isUsernameExist ||
        this.isOwnName ||
        this.hasUsernameFocus
      )
        return false;
      return true;
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.previousUrl = from.path;
    });
  },
  mounted: async function() {
    const network = await utils.queryParameters();
    console.log(network);
    if (network.current.transactionFee) {
      this.requiredTxFee = network.current.transactionFee;
    }
    this.loading = false;
  },
  methods: {
    redirect(url, option) {
      this.$router.push(url);
    },
    async checkUsername() {
      this.hasUsernameFocus = false;
      this.username = this.username.toLowerCase();
      this.checkingUsername = true;
      try {
        const address = await utils.getAddress(this.username.toLowerCase());
        if (address) {
          console.log('found address', address);
          this.isUsernameExist = true;
        } else {
          this.isUsernameExist = false;
        }
      } catch (e) {
        console.warn(e);
        this.isUsernameExist = false;
      }
      this.checkingUsername = false;
      this.showWarning = true;
    },
    onUsernameFocus() {
      this.hasUsernameFocus = true;
    },
    onDetectUsername(name) {
      this.username = name;
      this.showScanner = false;
    },
    onClickQRScanner() {
      this.showScanner = !this.showScanner;
    },
    async onSend() {
      if (!this.isUsernameExist) return;
      let isSubmitted = await utils.transferTokens(this.username, this.amount, this.getWallet.entry.keys);
      if (isSubmitted) {
        this.$ons.notification.alert('Transfer tx is submitted.');
        this.username = '';
        this.amount = '';
        this.redirect('/');
      }
    },
  },
};
</script>

<style lang="scss">
.send-coins-container {
  text-align: center;
  margin-top: 30px;
  width: 90%;
  max-width: 600px;
  margin: 30px auto;
  p {
    text-align: left;
  }
  .username-warning {
    margin: 0px auto;
    margin-bottom: 15px;
    height: 10px;
    padding-left: 10px;
    .valid-username {
      color: #21b72a;
    }
    .invalid-username {
      color: #de4747;
    }
  }
}
.secret-key-input {
  margin-right: 5px;
}
.qr-code-btn {
  height: 40px;
  padding: 5px;
}
.send-username-input-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  margin-bottom: 0px;
}
.send-amount-input-container {
  // display: flex;
  // flex-direction: column;
  // justify-content: space-between;
  // align-items: flex-start;
  height: 80px;
  margin-bottom: 30px;
}
.send-username-input {
  height: 40px;
  width: 100%;
  max-width: 600px;
}
.send-username-input.send-amount-input {
  width: 100%;
  height: 40px;
}
.input-error-message {
  color: red;
  font-weight: normal !important;
}
.required-tx-fee {
  display: block;
  text-align: left;
  width: 100%;
  margin-bottom: 10px;
  padding-left: 5px;
  color: #d79341;
  max-width: 600px;
  font-weight: bold;
}
</style>
