<template>
  <v-ons-page>
    <tool-bar :option="{ menu: false, notification: false, back: true }" />
    <div class="email-container">
      <Title text="Register Email" />
      <div v-if="hasEmailHash && hasVerified">
        <p class="body" id="verified-message">
          Your email address has been verified.
        </p>
      </div>
      <div v-else-if="hasEmailHash && !hasVerified">
        <p class="body" id="registered-message">
          You have registered email address. Please verify your email
          <nuxt-link class="link-to-import" to="/email/verify"
            ><strong>here</strong></nuxt-link
          >
        </p>
      </div>
      <form @submit.prevent="onRegisterEmail" class="email-form" v-else>
        <div class="email-input-container">
          <p class="body">Enter your email address</p>
          <input
            type="email"
            placeholder="Email"
            v-model="email"
            class="toll-input text-input"
          />
        </div>
        <div class="error-message-container">
          <p
            class="input-error-message"
            v-if="$v.email.required && !$v.email.email"
          >
            Invalid email address
          </p>
        </div>
        <Button
          text="Register Email"
          :onClick="onRegisterEmail"
          :isDisabled="!isEmailValid"
        />
        <p class="already-registered">
          Already received a verification code ? Please verify your email
          <nuxt-link class="link-to-import" to="/email/verify"
            ><strong>here</strong></nuxt-link
          >.
        </p>
      </form>
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

import Vuelidate from 'vuelidate'
import { required, minLength, between, email } from 'vuelidate/lib/validators'
Vue.use(VueOnsen)
Vue.use(Vuelidate)
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c))

export default {
  components: {
    Title,
    Button,
    ToolBar
  },
  data: function () {
    return {
      email: '',
      sending: false,
      hasEmailHash: false,
      hasVerified: false
    }
  },
  validations: {
    email: {
      required,
      email
    }
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      isUIReady: 'chat/isUIReady'
    }),
    isEmailValid () {
      if (this.$v.email.required && this.$v.email.email) return true
    }
  },
  methods: {
    async onRegisterEmail () {
      let self = this
      let isSubmitted = await utils.registerEmail(this.email, this.getWallet)
      if (isSubmitted) {
        this.email = ''
        self.$router.push('/email/verify')
      } else {
        this.notify('Failed to submit email registeration')
      }
    },
    redirect (url, option) {
      this.$router.push(url)
      if (url === '/' && option) {
      }
    },
    notify (message) {
      this.$ons.notification.alert(message)
    }
  },
  mounted: async function () {
    if (this.getAppState.emailHash) this.hasEmailHash = true
    if (this.getAppState.verified) this.hasVerified = true
  }
}
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
