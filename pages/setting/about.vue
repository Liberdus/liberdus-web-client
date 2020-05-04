<template>
  <v-ons-page>
    <tool-bar :option="{ menu: false, notification: false, back: true }" />
    <div class="about-container">
      <Title text="Liberdus" />
      <p class="about-liberdus">
        <a href="https://liberdus.com" target="_blank">Liberdus</a> is a payment
        network and the first application to be built with the
        <a href="https://shardus.com" target="_blank">Shardus</a> distributed
        ledger framework. The main purpose of Liberdus network is to enable
        people to govern their own money; and as a result, participate in a more
        fair and sustainable economy.
      </p>
      <p class="version-number">
        Version <strong>{{ version }}</strong>
      </p>
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
import { mapGetters } from 'vuex'
import utils from '../../assets/utils'
import ToolBar from '~/components/ToolBar'
import Title from '~/components/baisc/Title'
import Button from '~/components/baisc/Button'
import config from '~/config'

import Vuelidate from 'vuelidate'
import { required, minLength, between } from 'vuelidate/lib/validators'
Vue.use(VueOnsen)
Vue.use(Vuelidate)
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c))

export default {
  components: { Title, ToolBar },
  data: function () {
    return {
      version: config.version
    }
  }
}
</script>

<style lang="scss">
.about-container {
  width: 90%;
  max-width: 600px;
  margin: 20px auto;
  text-align: center;
  a {
    color: #1d4ab7;
  }
  p {
    text-align: left;
    margin-bottom: 10px;
    font-family: Poppins;
    font-size: 14px;
    color: #333333;
    letter-spacing: -0.16px;
  }
  .version-number {
    text-align: center;
  }
}
</style>
