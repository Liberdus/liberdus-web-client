<template>
  <div>
    <div class="email-container">
      <a-card title="Register Email">
        <div v-if="hasEmailHash && hasVerified">
          <p id="verified-message" class="body">
            Your email address has been verified.
          </p>
        </div>
        <div v-else-if="hasEmailHash && !hasVerified">
          <p id="registered-message" class="body">
            A verification code has been sent to your inbox. Please verify your email
            <nuxt-link class="link-to-import" to="/email/verify">
              <strong>here</strong>
            </nuxt-link>
          </p>
        </div>
        <form v-else class="email-form">
          <div class="email-input-container">
            <p class="body">
              Enter your email address
            </p>
            <a-input v-model="email" type="email" placeholder="Email" size="large" />
          </div>
          <div class="error-message-container">
            <p v-if="$v.email.required && !$v.email.email" class="input-error-message">
              Invalid email address
            </p>
          </div>
          <a-button
            :disabled="!isEmailValid"
            @click="onRegisterEmail"
            size="large"
            shape="round"
            type="primary"
            style="width: 100%; margin-bottom:20px"
          >
            Register Email
          </a-button>
          <p class="already-registered">
            Already received a verification code ? Please verify your email
            <nuxt-link class="link-to-import" to="/email/verify">
              <strong>here</strong> </nuxt-link
            >.
          </p>
        </form>
      </a-card>
    </div>
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
import { required, minLength, between, email } from 'vuelidate/lib/validators';
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
      email: '',
      sending: false,
      hasEmailHash: false,
      hasVerified: false,
    };
  },
  validations: {
    email: {
      required,
      email,
    },
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      isUIReady: 'chat/isUIReady',
    }),
    isEmailValid() {
      if (this.$v.email.required && this.$v.email.email) return true;
    },
  },
  mounted: async function() {
    if (this.getAppState.emailHash) this.hasEmailHash = true;
    if (this.getAppState.verified === true) this.hasVerified = true;
  },
  methods: {
    async onRegisterEmail(e) {
      e.preventDefault();
      let self = this;
      let isSubmitted = await utils.registerEmail(this.email, this.getWallet);
      console.log(`is submitted: `, isSubmitted);
      if (isSubmitted) {
        this.email = '';
        self.$router.push('/email/verify');
      } else {
        this.notify('Failed to submit email registeration');
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
.email-container {
  width: 90%;
  max-width: 600px;
  margin: 30px auto;
  text-align: center;
  .body {
    text-align: left;
    margin-bottom: 10px;
    font-family: Poppins;
    font-size: 14px;
    color: #333333;
    letter-spacing: -0.16px;
    text-align: left;
  }
  #verified-message {
    text-align: center;
    color: #1faa1f;
    font-weight: bold;
  }
  #registered-message {
    text-align: center;
    color: #f0852e;
  }
  label {
    text-align: left;
    display: block;
    width: 100%;
  }
}
.email-form {
  .email-input-container {
    margin-bottom: 0px;
  }
  .error-message-container {
    height: 20px;
    .input-error-message {
      text-align: left;
      color: red;
      height: 20px;
    }
  }
}
// .email-input-container {
//   height: 80px;
//   margin-bottom: 20px;
// }
</style>
