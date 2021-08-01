<template>
  <v-ons-page>
    <tool-bar :option="{ menu: false, back: true, backUrl: '/welcome' }" />
    <div class="import-account-container">
      <p class="text-body">
        Enter or Scan your
        <strong>Secret Key</strong> to import your account.
      </p>
      <q-reader :on-detect-q-r="onDetectSk" :scanning="showScanner" />
      <v-ons-button v-if="showScanner" class="new-message-btn" modifier="quiet" @click="onClickQRScanner">
        Close QR Scanner
      </v-ons-button>

      <div class="secret-input-container">
        <a-input placeholder="Secret Key" size="large" v-model="secretKey"> </a-input>
        <a-button slot="enterButton" @click="onClickQRScanner" class="qr-code-btn">
          <img src="../../assets/qrcode.png" alt="qr-code" />
        </a-button>
        <!-- <input
          v-model="secretKey"
          placeholder="Secret key"
          class="text-input"
        >
        <v-ons-button
          modifier="quiet"
          class="qr-code-btn"
          @click="onClickQRScanner"
        >
          <img
            src="../../assets/qrcode.png"
            alt="qr-code"
          >
        </v-ons-button> -->
      </div>

      <a-button @click="onImportAccount" size="large" type="primary">
        Import Account
      </a-button>
    </div>
  </v-ons-page>
</template>

<script>
import Vue from 'vue';
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import VueOnsen from 'vue-onsenui/esm';
import OnsenComponents from '~/components/Onsen';
import ChatText from '~/components/ChatText';
import ChatInput from '~/components/ChatInput';
import QReader from '~/components/QReader';
import utils from '../../assets/utils';
import { mapActions } from 'vuex';
import ToolBar from '~/components/ToolBar';
import Title from '~/components/basic/Title';
import Button from '~/components/basic/Button';

Vue.use(VueOnsen);
Object.values(OnsenComponents).forEach((c) => Vue.component(c.name, c));

export default {
  components: {
    QReader,
    ToolBar,
    Button,
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.previousUrl = from.path;
    });
  },
  data: function() {
    return {
      secretKey: '',
      previousUrl: '/',
      showScanner: false,
    };
  },
  computed: {},
  methods: {
    ...mapActions({
      addWallet: 'wallet/addWallet',
    }),
    onDetectSk(sk) {
      this.secretKey = sk;
      this.showScanner = false;
    },
    redirect(url, option) {
      this.$router.push(url);
      if (url === '/' && option) {
      }
    },
    onClickAddSign() {},
    onClickQRScanner() {
      console.log('onClickQRScanner');
      this.showScanner = !this.showScanner;
    },
    async onImportAccount() {
      try {
        let { handle, entry } = await utils.importWallet(this.secretKey.toLowerCase());
        let wallet = {
          handle: handle,
          entry: entry,
        };
        utils.saveWallet(wallet);
        this.addWallet(wallet);
        this.$router.push('/?tabIndex=0');
      } catch (e) {}
    },
  },
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
