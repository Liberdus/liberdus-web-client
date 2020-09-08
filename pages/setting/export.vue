<template>
  <!-- <v-ons-page> -->
  <div>
    <!-- <tool-bar :option="{ menu: false, notification: false, back: true}" /> -->
    <div class="import-account-container">
      <a-card title="Your Secret Key">
        <p id="secret-key">
          <strong>{{ secretKey }}</strong>
        </p>

        <p class="secret-key-warning">
          Do not share your
          <strong>Secret Key</strong> to anyone
        </p>

        <qriously
          :value="secretKey"
          :size="200"
          class="qr-code"
        />
        
        <a-button
          @click="onCopy"
          size="large"
          shape="round"
          type="primary"
        >
          Copy Secret Key
        </a-button>
      </a-card>
    </div>
  <!-- </v-ons-page> -->
  </div>
</template>

<script>
import Vue from "vue";
import "onsenui/css/onsenui.css";
import "onsenui/css/onsen-css-components.css";
import VueOnsen from "vue-onsenui/esm";
import OnsenComponents from "~/components/Onsen";
import ChatText from "~/components/ChatText";
import ChatInput from "~/components/ChatInput";
import VueQriously from "vue-qriously";
import { mapGetters, mapActions } from "vuex";
import utils from "../../assets/utils";
import ToolBar from "~/components/ToolBar";
import Title from "~/components/baisc/Title";
import Button from "~/components/baisc/Button";

Vue.use(VueOnsen);
Vue.use(VueQriously);
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c));

export default {
  components: {
    Title,
    Button,
    ToolBar
  },
  layout: 'dashboard',
  data: function() {
    return {};
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      isUIReady: "chat/isUIReady"
    }),
    secretKey() {
      return this.getWallet.entry.keys.secretKey.toLowerCase();
      // return "1ABCDEFGEC9BDF64E5941F6421CB6650E4F8552E1191ECFD372C8ED7D4D5UVWXYZ";
    }
  },
  methods: {
    redirect(url, option) {
      this.$router.push(url);
    },
    onCopy() {
      utils.copyToClipboard(this.secretKey);
      this.$ons.notification.alert("Copied to clipboard!");
    }
  }
};
</script>

<style>
#secret-key {
  margin: 20px auto;
  word-break: break-word;
  font-family: Inconsolata;
  font-size: 17px;
  color: #2f457a;
  letter-spacing: -0.21px;
  text-align: center;
  line-height: 27px;
}
#secret-key > strong {
  user-select: text;
}
.qr-code {
  margin: 30px auto;
  width: 200px;
  display: block;
  position: relative;
}
.import-account-container .secret-key-warning {
  font-family: Poppins;
  font-size: 14px;
  color: #ce6f43;
  letter-spacing: -0.16px;
  text-align: center;
}
</style>
