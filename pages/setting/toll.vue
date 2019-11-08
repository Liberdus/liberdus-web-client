<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="left">
        <v-ons-icon icon="ion-ios-arrow-back" size="lg" @click="redirect('/', {tab: 'setting'})"></v-ons-icon>
      </div>
      <div class="center">Toll Setting</div>
      <div class="right">
        <v-ons-toolbar-button icon="ion-navicon"></v-ons-toolbar-button>
      </div>
    </v-ons-toolbar>

    <div class="toll-container">
      <p v-if="getAppState">Current Toll Amount: {{ getAppState.data.toll }} Coins</p>
      <p v-else>Current Toll Amount: -</p>
      <form @submit.prevent="onUpdateToll" class="toll-form">
        <div class="toll-amount-input-container">
          <input type="text" placeholder="New toll amount" v-model="newToll" class="toll-input" />
          <p
            class="input-error-message"
            v-if="$v.newToll.required && !$v.newToll.between"
          >Invalid toll amount</p>
        </div>
        <v-ons-button class="default-btn" :disabled="!isTollVaild" type="submit" @click="onUpdateToll">Update Toll</v-ons-button>
      </form>
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
import { mapGetters } from "vuex";
import utils from "../../assets/utils";

import Vuelidate from "vuelidate";
import { required, minLength, between } from "vuelidate/lib/validators";
Vue.use(VueOnsen);
Vue.use(Vuelidate);
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c));

export default {
  data: function() {
    return {
      newToll: ""
    };
  },
  validations: {
    newToll: {
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
    isTollVaild() {
      if (this.$v.newToll.required && this.$v.newToll.between) return true;
    }
  },
  methods: {
    async onUpdateToll() {
      let isSubmitted = await utils.setToll(
        this.newToll,
        this.getWallet.entry.keys
      );
      if (isSubmitted) {
        this.newToll = "";
        this.notify("Your transaction is submitted to network.");
      }
    },
    redirect(url, option) {
      this.$router.push(url);
      if (url === "/" && option) {
      }
    },
    notify(message) {
      this.$ons.notification.alert(message);
    }
  }
};
</script>

<style>
.toll-container {
  width: 80%;
  max-width: 300px;
  margin: 20px auto;
  text-align: center;
}
.toll-input {
  height: 40px;
  width: 100%;
  padding: 5px 10px;
  background: #fff;
  border: 1px solid #dddddd;
  border-radius: 5px;
  margin: 20px auto;
  margin-bottom: 5px;
}
.toll-form .input-error-message {
  text-align: left;
  color: red;
}
.toll-amount-input-container {
  height: 80px;
  margin-bottom: 20px;
}
</style>
