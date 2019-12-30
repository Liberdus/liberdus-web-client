<template>
  <v-ons-page>
    <tool-bar :option="{ menu: false, notification: false, back: true}" />
    <div class="send-coins-container">
      <Title text="Send Coins" />
      <div v-if="requiredTxFee">
        <p class="body">Enter username</p>
        <q-reader :onDetectQR="onDetectUsername" :scanning="showScanner" />
        <v-ons-button
          v-if="showScanner"
          class="new-message-btn"
          modifier="quiet"
          @click="onClickQRScanner"
        >Close QR Scanner</v-ons-button>
        <div class="send-username-input-container">
          <input
            type="text"
            placeholder="Username"
            v-model="username"
            class="send-username-input text-input"
            @focusout="checkUsername"
            @focusin="onUsernameFocus"
          />
          <v-ons-button modifier="quiet" @click="onClickQRScanner" class="qr-code-btn">
            <img src="../../assets/qrcode.png" alt="qr-code" />
          </v-ons-button>
        </div>
        <div class="username-warning">
          <p v-if="isOwnName" class="invalid-username">You cannot send coins to yourself.</p>
          <p
            v-else-if="username.length > 0 && !hasUsernameFocus && !checkingUsername && !isUsernameExist"
            class="invalid-username"
          >The username provided does not exist.</p>
          <p
            v-else-if="username.length > 0 && !hasUsernameFocus && !checkingUsername && isUsernameExist"
            class="valid-username"
          >The username is valid.</p>
        </div>
        <div class="send-amount-input-container">
          <p class="body">Enter amount to send</p>
          <input
            type="text"
            placeholder="Amount"
            v-model="amount"
            class="send-username-input send-amount-input text-input"
          />
          <p
            class="input-error-message"
            v-if="$v.amount.required && !$v.amount.between"
          >Invalid amount</p>
        </div>
        <p
          class="required-tx-fee"
        >Tx Fee {{ requiredTxFee }} coins will be deducted from your account.</p>
        <Button text="Send" :onClick="onSend" :disabled="!isFormValid" />
      </div>

      <div v-else>Getting required tx fee...</div>
    </div>
  </v-ons-page>
</template>

<script>
import Vue from "vue";
import "onsenui/css/onsenui.css";
import "onsenui/css/onsen-css-components.css";
import VueOnsen from "vue-onsenui/esm";
import OnsenComponents from "~/components/Onsen";
import ChatText from "~/components/ChatText";
import ChatInput from "~/components/ChatInput";
import QReader from "~/components/QReader";
import { mapGetters, mapActions } from "vuex";
import utils from "../../assets/utils";
import Vuelidate from "vuelidate";
import { required, minLength, between } from "vuelidate/lib/validators";
import ToolBar from "~/components/ToolBar";
import Title from "~/components/baisc/Title";
import Button from "~/components/baisc/Button";
Vue.use(VueOnsen);
Vue.use(Vuelidate);
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c));

export default {
  components: {
    QReader,
    Title,
    Button,
    ToolBar
  },
  data: function() {
    return {
      username: "",
      amount: "",
      previousUrl: "/",
      showScanner: false,
      isUsernameExist: true,
      checkingUsername: false,
      hasUsernameFocus: false,
      requiredTxFee: null
    };
  },
  validations: {
    username: {
      required,
      minLength: minLength(1)
    },
    amount: {
      required,
      between: between(1, 1000)
    }
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState",
      isUIReady: "chat/isUIReady"
    }),
    isOwnName() {
      if (this.username.toLowerCase() === this.getWallet.handle) return true;
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
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.previousUrl = from.path;
    });
  },
  mounted: async function() {
    const network = await utils.queryParameters();
    if (network.CURRENT.transactionFee) {
      this.requiredTxFee = network.CURRENT.transactionFee;
    }
  },
  methods: {
    redirect(url, option) {
      this.$router.push(url);
    },
    async checkUsername() {
      this.hasUsernameFocus = false;
      this.checkingUsername = true;
      try {
        const address = await utils.getAddress(this.username);
        if (address) this.isUsernameExist = true;
        else this.isUsernameExist = false;
      } catch (e) {
        console.log(e);
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
      let isSubmitted = await utils.transferTokens(
        this.username,
        this.amount,
        this.getWallet.entry.keys
      );
      if (isSubmitted) {
        this.$ons.notification.alert("Transfer tx is submitted.");
        this.username = "";
        this.amount = "";
        this.redirect("/");
      }
    }
  }
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  height: 80px;
  margin-bottom: 10px;
}
.send-username-input {
  height: 40px;
  width: 100%;
  max-width: 600px;
}
.send-username-input.send-amount-input {
  width: 100%;
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
