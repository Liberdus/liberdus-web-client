<template>
  <!-- <v-ons-page> -->
  <div>
    <a-card title="Verify Email" style="max-width: 600px; margin:auto">
      <div
        v-if="checkingCode"
        class="checkingCode-container"
      >
        <v-ons-progress-circular indeterminate />
        <p class="body">
          Checking verification code
        </p>
      </div>

      <div
        v-else-if="!checkingCode && codeAccepted"
        class="checkingCode-container"
      >
        <p
          id="verified-message"
          class="body"
        >
          Your email address has been verified.
        </p>
      </div>

      <div
        v-else
        class="email-container"
      >
        <form class="email-form">
          <p class="body error-warning">
            {{ error }}
          </p>

          <div class="email-input-container">
            <p class="body">
              Enter the verification code sent to your email
            </p>
            <a-input
              v-model="code"
              type="text"
              placeholder="Verification code"
              size="large"
            />
          </div>

          <div class="error-message-container">
            <p
              v-if="!$v.code.integer"
              class="input-error-message"
            >
              Code must be digits only
            </p>
            <p
              v-else-if="code.length > 0 && !$v.code.minLength"
              class="input-error-message"
            >
              Required at least 6 digits
            </p>
          </div>

          <a-button
            @click="onVerifyCode"
            :disabled="!isCodeValid"
            size="large"
            shape="round"
            type="primary"
          >Submit Verification Code
          </a-button>
        </form>
      </div>
      </a-card>
    </div>
  <!-- </v-ons-page> -->
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
import {
  required,
  minLength,
  integer,
  between,
  email
} from 'vuelidate/lib/validators'
Vue.use(VueOnsen)
Vue.use(Vuelidate)
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c))

export default {
  components: {
    Title,
    Button,
    ToolBar
  },
  layout: 'dashboard',
  data: function () {
    return {
      email: '',
      code: '',
      error: '',
      sending: false,
      checkingCode: false,
      codeChecker: null,
      codeAccepted: false
    }
  },
  validations: {
    email: {
      required,
      email
    },
    code: {
      required,
      minLength: minLength(6),
      integer
    }
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      isUIReady: 'chat/isUIReady'
    }),
    isCodeValid () {
      // if (
      //   this.$v.code.required ||
      //   this.$v.code.minLength ||
      //   this.$v.code.integer
      // ) {
      //   console.log('here1')
      //   return false
      // }

      const hashedCode = utils.hashVerificationCode(this.code)
      if (this.getAppState.verified === hashedCode) return true
      return false
    }
  },
  beforeDestroy: function () {
    clearInterval(this.codeChecker)
    this.codeChecker = null
  },
  methods: {
    async onVerifyCode (e) {
      e.preventDefault()

      this.error = ''
      let self = this
      this.checkingCode = true
      let isSubmitted = await utils.verifyEmail(this.code, this.getWallet)
      if (isSubmitted) {
        this.email = ''
        this.codeChecker = setInterval(this.checkVerification, 1000)
        setTimeout(function () {
          this.codeAccepted = false
          this.checkingCode = false
          clearInterval(this.codeChecker)
          this.codeChecker = null
          this.error =
            'Verification code is not approved within 15 seconds. Please try again.'
        }, 15000)
        // this.notify('Your verification code is submitted to network.')
        // this.$router.push('/')
      } else {
        this.notify('Failed to submit verification code.')
      }
    },
    async checkVerification () {
      let self = this
      if (this.getAppState.emailHash && this.getAppState.verified === true) {
        this.codeAccepted = true
        this.checkingCode = false
        clearInterval(this.codeChecker)
        this.codeChecker = null
        this.$ons.notification
          .alert('Your verification code is approved.')
          .then(result => {
            this.redirect('/')
          })
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
  }
}
</script>

<style lang="scss">
.email-container {
  width: 90%;
  max-width: 600px;
  margin: 20px auto;
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
.checkingCode-container {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 75px);
  position: relative;
  top: -75px;
  .body {
    text-align: center;
    margin: 20px auto;
  }
}
</style>
