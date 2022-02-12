<template>
  <!-- <v-ons-page> -->
  <div>
    <!-- <tool-bar :option="{ menu: false, notification: false, back: true }" /> -->

    <div class="toll-container">
      <a-card title="Update toll amount">
        <a-statistic v-if="getAppState" title="Current Toll Amount" :value="getAppState.data.toll || '0'" suffix="LBD" />
        <a-statistic v-else title="Current Toll Amount" :value="'--'" suffix="LBD" />
        <!-- <p v-if="getAppState">
          Current Toll Amount:
          <strong>{{ getAppState.data.toll || '0' }} Coins</strong>
        </p> -->
        <!-- <p v-else>
          Current Toll Amount: -
        </p> -->

        <form class="toll-form" @submit.prevent="onUpdateToll">
          <div class="toll-amount-input-container">
            <a-input v-model="newToll" type="text" placeholder="New toll amount" size="large" />

            <p v-if="$v.newToll.required && !$v.newToll.between" class="input-error-message">
              Invalid toll amount
            </p>
          </div>
          <a-button @click="onUpdateToll" :disabled="!isTollVaild" size="large" shape="round" type="primary">Update Toll Amount</a-button>
        </form>
      </a-card>
    </div>
    <!-- </v-ons-page> -->
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
import utils from '../../assets/utils';
import ToolBar from '~/components/ToolBar';
import Title from '~/components/basic/Title';
import Button from '~/components/basic/Button';

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
      newToll: '',
    };
  },
  validations: {
    newToll: {
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
    isTollVaild() {
      if (this.$v.newToll.required && this.$v.newToll.between) return true;
    },
  },
  methods: {
    async onUpdateToll() {
      let isSubmitted = await utils.setToll(this.newToll, this.getWallet.entry.keys);
      if (isSubmitted) {
        this.newToll = '';
        this.notify('Your transaction is submitted to network.');
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
  p {
    text-align: left;
    margin-bottom: 10px;
    font-family: Poppins;
    font-size: 14px;
    color: #333333;
    letter-spacing: -0.16px;
    text-align: left;
  }

  .ant-input {
    max-width: 300px;
  }
}
/* .toll-input {
  height: 40px;
  width: 100%;
  padding: 5px 10px;
  background: #fff;
  border: 1px solid #dddddd;
  border-radius: 5px;
  margin: 20px auto;
  margin-top: 5px;
} */
.toll-form .input-error-message {
  text-align: left;
  color: red;
}
.toll-amount-input-container {
  height: 40px;
  margin-top: 40px;
  margin-bottom: 30px;
}
</style>
