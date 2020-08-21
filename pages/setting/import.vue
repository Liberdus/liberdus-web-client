<template>
  <v-ons-page>
    <tool-bar :option="{ menu: false, back: true, backUrl: '/welcome'}" />
    <div class="import-account-container">
      <p class="text-body">
        Enter or Scan your
        <strong>Secret Key</strong> to import your account.
      </p>
      <q-reader :onDetectQR="onDetectSk" :scanning="showScanner" />
      <v-ons-button
        v-if="showScanner"
        class="new-message-btn"
        modifier="quiet"
        @click="onClickQRScanner"
      >Close QR Scanner</v-ons-button>

      <div class="secret-input-container">
        <input placeholder="Secret key" v-model="secretKey" class="text-input" />
        <v-ons-button modifier="quiet" @click="onClickQRScanner" class="qr-code-btn">
          <img src="../../assets/qrcode.png" alt="qr-code" />
        </v-ons-button>
      </div>

      <Button text="Import Account" :onClick="onImportAccount" />
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
import utils from "../../assets/utils";
import { mapActions } from "vuex";
import ToolBar from "~/components/ToolBar";
import Title from "~/components/baisc/Title";
import Button from "~/components/baisc/Button";

Vue.use(VueOnsen);
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c));

export default {
  components: {
    QReader,
    ToolBar,
    Button
  },
  data: function() {
    return {
      secretKey: "",
      previousUrl: "/",
      showScanner: false
    };
  },
  computed: {},
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.previousUrl = from.path;
    });
  },
  methods: {
    ...mapActions({
      addWallet: "wallet/addWallet"
    }),
    onDetectSk(sk) {
      this.secretKey = sk;
      this.showScanner = false;
    },
    redirect(url, option) {
      this.$router.push(url);
      if (url === "/" && option) {
      }
    },
    onClickAddSign() {},
    onClickQRScanner() {
      this.showScanner = !this.showScanner;
    },
    async onImportAccount() {
      let { handle, entry } = await utils.importWallet(
        this.secretKey.toLowerCase()
      );
      let wallet = {
        handle: handle,
        entry: entry
      };
      console.log(wallet);
      utils.saveWallet(wallet);
      this.addWallet(wallet);
      this.$router.push("/?tabIndex=0");
    }
  }
};
</script>

<style>
.import-account-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  margin-top: 50px;
  height: auto;
  text-align: center;
  padding: 20px;
}
.secret-key-input {
  margin-right: 5px;
}
.qr-code-btn {
  height: 40px;
  padding: 5px;
}
.secret-input-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px auto;
}
</style>
