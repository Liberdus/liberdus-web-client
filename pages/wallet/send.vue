<template>
  <v-ons-page>
    <tool-bar :option="{ menu: true, notification: true, back: true}" />
    <div class="send-coins-container">
      <Title text="Send Coins" />
      <p class="body">Enter username to send coins</p>
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
        />
        <v-ons-button modifier="quiet" @click="onClickQRScanner" class="qr-code-btn">
          <img src="../../assets/qrcode.png" alt="qr-code" />
        </v-ons-button>
      </div>
      <p class="body">Enter amount to send</p>
      <div class="send-amount-input-container">
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
      <Button text="Send" :onClick="onSend" :disabled="!isFormValid" />
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
      showScanner: false
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
    isFormValid() {
      if (
        !this.$v.username.required ||
        !this.$v.amount.required ||
        !this.$v.amount.between
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
  methods: {
    redirect(url, option) {
      this.$router.push(url);
    },
    onDetectUsername(name) {
      this.username = name;
      this.showScanner = false;
    },
    onClickQRScanner() {
      this.showScanner = !this.showScanner;
    },
    async onSend() {
      let receiverAddress = await utils.getAddress(this.username.toLowerCase());
      if (!receiverAddress) {
        this.$ons.notification.alert("Failed. Invalid Username");
        return;
      }
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

<style>
.send-coins-container {
  text-align: center;
  margin-top: 30px;
  width: 90%;
  max-width: 600px;
  margin: 30px auto;
}
.send-coins-container p {
  text-align: left;
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
  height: 80px;
  margin-bottom: 10px;
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
</style>
