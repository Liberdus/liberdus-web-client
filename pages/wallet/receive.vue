<template>
  <v-ons-page>
    <tool-bar :option="{ menu: false, notification: false, back: true }" />
    <!-- TODO: -->
    <div class="receive-container" v-if="getWallet.handle">
      <Title text="Receive Coins" />
      <p>Share your username to your senders</p>
      <!-- TODO
      <p id="username">{{getWallet.handle}}</p>
      <qriously :value="getWallet.handle" :size="200" class="qr-code" />-->
      <p id="username">
        <strong>{{ getWallet.handle }}</strong>
      </p>
      <qriously :value="getWallet.handle" :size="200" class="qr-code" />
      <Button text="Copy Account Address" :onClick="onCopy" />
    </div>
  </v-ons-page>
</template>

<script>
import Vue from 'vue'
import 'onsenui/css/onsenui.css'
import 'onsenui/css/onsen-css-components.css'
import VueOnsen from 'vue-onsenui/esm'
import OnsenComponents from '~/components/Onsen'
import ChatText from '~/components/ChatText'
import ChatInput from '~/components/ChatInput'
import VueQriously from 'vue-qriously'
import { mapGetters, mapActions } from 'vuex'
import utils from '../../assets/utils'
import ToolBar from '~/components/ToolBar'
import Title from '~/components/baisc/Title'
import Button from '~/components/baisc/Button'

Vue.use(VueOnsen)
Vue.use(VueQriously)
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c))

export default {
  components: {
    Title,
    Button,
    ToolBar
  },
  data: function () {
    return {}
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      isUIReady: 'chat/isUIReady'
    })
  },
  methods: {
    redirect (url, option) {
      this.$router.push(url)
      if (url === '/' && option) {
      }
    },
    onCopy () {
      // TODO
      // utils.copyToClipboard(this.getWallet.handle);
      // this.$ons.notification.alert("Copied to clipboard!");
      utils.copyToClipboard(this.getWallet.handle)
      this.$ons.notification.alert('Copied to clipboard!')
    }
  }
}
</script>

<style>
.receive-container {
  text-align: center;
  margin: 30px auto;
  height: auto;
  width: 90%;
  max-width: 600px;
}
.username-input {
  margin-right: 5px;
}
.qr-code-btn {
  height: 48px;
  padding: 5px;
  width: 52px !important;
  padding: 5px;
  border-radius: 40px;
  background: #f5f5f5;
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.qr-code-btn img {
  width: 25px;
  height: 25px;
}
.secret-input-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.receive-container p {
  font-family: Poppins;
  font-size: 13px;
  color: #636363;
  letter-spacing: -0.14px;
  text-align: center;
}
#username {
  font-family: Inconsolata;
  font-size: 24px;
  color: #2f457a;
  letter-spacing: -0.21px;
  text-align: center;
  line-height: 27px;
  margin: 20px auto;
}
#username > strong {
  user-select: text;
}
.qr-code {
  margin-bottom: 20px;
}
</style>
