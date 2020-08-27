<template>
  <v-ons-page class="create-account-page">
    <div
      class="create-account-container"
      :style="{ backgroundImage: `url(${backgroundUrl})` }"
    >
      <tool-bar :option="{ menu: false, back: true, backUrl: '/welcome' }" />
      <div v-if="creatingHandle" class="create-account-content">
        <h3>Creating New Account</h3>
        <v-ons-progress-bar indeterminate></v-ons-progress-bar>
      </div>
      <div v-else class="create-account-content">
        <a-row type="flex" justify="space-around" :gutter="[20,20]">
          <a-col :span="24">
            <h1>Sign In or Create Account</h1>
          </a-col>
          <a-col :span="24">
            <h2>Enter your username to sign in existing account or create a new one</h2>
          </a-col>
          <a-col :span="24">
            <a-row :gutter="[0,5]">
              <a-col :span="24">
                <a-input 
                  size="large"
                  placeholder="Username"
                  v-model="username"
                  v-on:keyup="loadAccount"
                />
              </a-col>
              <a-col :span="24">
                <div v-if="!allowSignIn">
                  <p class="input-error-message" v-if="!isNodeOnline">
                    Unable to connect to server node.
                  </p>
                  <p
                    class="input-error-message"
                    v-else-if="$v.username.required && !$v.username.alphaNum"
                  >
                    Username can contain only alphabets and numberic characters
                  </p>
                  <p
                    class="input-error-message"
                    v-else-if="$v.username.required && !$v.username.minLength"
                  >
                    Username must be at least 3 characters long
                  </p>
                  <div v-else-if="!checkingUsername">
                    <p class="input-error-message" v-if="isUsernameTaken">
                      Username is already taken.
                    </p>
                    <p class="input-success-message" v-else-if="isUsernameValid">
                      Username is available.
                    </p>
                  </div>
                  <div v-else-if="checkingUsername">
                    <p class="input-checking-message">Checking username...</p>
                  </div>
                </div>
                <div v-if="allowSignIn">
                  <p class="input-success-message">
                    Valid account found in the local wallet.
                  </p>
                </div>
              </a-col>
            </a-row>
            
          </a-col>
          <a-col :span="24">
            <a-button type="primary" size="large" @click="onSignIn" v-if="existingValidAccount">
              Sign In
            </a-button>
            <a-button type="primary" size="large" @click="onCreateAccount" v-else :disabled="!isUsernameValid">
              Create Account
            </a-button>
          </a-col>
          <a-col :span="24">
            <p class="already-registered">
              Already registered ? Please import your account
              <nuxt-link class="link-to-import" to="/setting/import">
                <strong>here</strong> </nuxt-link
              >.
            </p>
          </a-col>
        </a-row>
      </div>
    </div>
  </v-ons-page>
</template>

<script>
import Vue from 'vue'
import 'onsenui/css/onsenui.css'
import 'onsenui/css/onsen-css-components.css'
import Vuelidate from 'vuelidate'
import VueOnsen from 'vue-onsenui/esm'
import OnsenComponents from '~/components/Onsen'
import ChatText from '~/components/ChatText'
import ChatInput from '~/components/ChatInput'
import utils from '../assets/utils'
import { mapActions, mapGetters } from 'vuex'
import { required, minLength, alphaNum } from 'vuelidate/lib/validators'
import Title from '~/components/baisc/Title'
import Button from '~/components/baisc/Button'
import ToolBar from '~/components/ToolBar'
import backgroundUrl from '~/assets/images/liberdus_background.png'

Vue.use(Vuelidate)
Vue.use(VueOnsen)
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c))
export default {
  components: { Title, Button, ToolBar },
  data: function () {
    return {
      username: '',
      isUsernameTaken: false,
      checkingUsername: false,
      creatingHandle: false,
      backgroundUrl,
      existingValidAccount: null,
      allowSignIn: false,
      isNodeOnline: true,
      registerWithLocalAccountAddress: false,
      localWallet: null,
      nameCheckerTimeout: null
    }
  },
  filters: {
    lowerCase: str => {
      if (!str) return
      return str.toLowerCase()
    }
  },
  validations: {
    username: {
      required,
      minLength: minLength(3),
      alphaNum
    }
  },
  computed: {
    isUsernameValid () {
      return (
        !this.$v.username.$invalid &&
        !this.isUsernameTaken &&
        !this.checkingUsername
      )
    }
  },
  methods: {
    ...mapActions({
      addWallet: 'wallet/addWallet',
      updateLastMessage: 'chat/updateLastMessage',
      updateLastTx: 'chat/updateLastTx'
    }),
    async onCreateAccount () {
      let self = this
      if (!this.username || this.username.length === 0) return
      let wallet
      if (this.registerWithLocalAccountAddress) {
        wallet = this.localWallet
      } else {
        let entry = utils.createWallet(this.username)
        wallet = {
          handle: this.username,
          entry: entry
        }
      }
      this.addWallet(wallet)
      let isSubmitted = await utils.registerAlias(wallet.handle, wallet.entry)
      if (isSubmitted) {
        this.creatingHandle = true
        let isCreated
        let accountCreatedChecker = setInterval(async () => {
          isCreated = await self.checkAccountCreated(wallet.handle)
          if (isCreated) {
            clearInterval(accountCreatedChecker)
            accountCreatedChecker = null
            utils.saveWallet(wallet)
            self.$router.push('/')
          }
        }, 1000)
      }
    },
    async checkUsername () {
      console.log('Checking username for: ', this.username)
      this.username = this.username.toLowerCase()
      this.checkingUsername = true
      try {
        let remoteAddress = await utils.getAddress(this.username)
        if (remoteAddress) {
          let wallets
          try {
            wallets = JSON.parse(localStorage.getItem('wallets'))
          } catch (e) {
            console.warn(e)
          }
          if (!wallets) {
            this.checkingUsername = false
            this.isUsernameTaken = true
            return
          }
          let foundWallet = wallets.find(w => w.address === remoteAddress)
          if (wallets && foundWallet) {
            this.allowSignIn = true
          } else {
            this.isUsernameTaken = true
          }
          this.checkingUsername = false
          return
        } else {
          this.isUsernameTaken = false
          this.checkingUsername = false
        }
      } catch (e) {
        console.warn(e.message)
        this.isUsernameTaken = false
        this.checkingUsername = false
      }
    },
    async checkAccountCreated (handle) {
      let address = await utils.getAddress(handle)
      if (address) {
        console.log(`Account created successfully.`)
        return true
      }
      return false
    },
    async loadAccount () {
      this.checkingUsername = true
      if (this.nameCheckerTimeout) {
        console.log('Clearing existing timeout first...')
        clearTimeout(this.nameCheckerTimeout)
        this.nameCheckerTimeout = null
      }
      this.nameCheckerTimeout = setTimeout(this.checkUsername, 1000)
      const localWallet = utils.loadWallet(this.username)

      if (localWallet) {
        const remoteAccountAddress = await utils.getAddress(localWallet.handle)
        const localAccountAddress = localWallet.entry.address
        if (remoteAccountAddress === localAccountAddress) {
          this.existingValidAccount = localWallet
          this.allowSignIn = true
        } else {
          this.existingValidAccount = null
          this.allowSignIn = false
          this.registerWithLocalAccountAddress = true
          this.localWallet = localWallet
        }
      } else {
        console.log('No local wallet found with username: ', this.username)
        this.existingValidAccount = null
        this.allowSignIn = false
      }
      this.checkingUsername = false
    },
    onSignIn () {
      this.addWallet(this.existingValidAccount)
      const lastMessage = utils.loadLastMessage(this.username)
      const lastTx = utils.loadLastTx(this.username)
      if (lastMessage) {
        this.updateLastMessage(lastMessage)
      }
      if (lastTx) {
        this.updateLastTx(lastTx)
      }
      this.$router.push('/')
    }
  },
  mounted: function () {
    let self = this
    setTimeout(() => {
      try {
        self.$refs['usenameInput'].focus()
      } catch (e) {}
    }, 500)
  }
}
</script>

<style lang="scss">
.create-account-container {
  width: 100%;
  margin: 0 auto;
  height: 100vh;
  text-align: center;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fbfbfb;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position-x: center;
  background-position-y: 100px;

  .input-error-message {
    color: red;
    font-weight: normal !important;
  }
  .input-success-message {
    color: green;
  }
  .input-checking-message {
    color: #333;
    font-size: 12px;
    text-align: left;
  }
  .already-registered {
    font-size: 13px;
    color: #9a9a9a;
    letter-spacing: -0.14px;
    text-align: center;
    margin-top: 15px;
  }
  h1 {
    margin: 0px;
    text-align: center;
    font-size: 40px;
  }

  h2 {
    margin-top: 0px;
    text-align: center;
    font-size: 20px;
  }

  .create-account-content {
    max-width: 600px;
  }

  .ant-btn {
    width: 100%;
  }
}


.link-to-import {
  color: #43b8e7 !important;
  cursor: pointer;
}
ons-progress-circular {
  width: 50px;
  height: 50px;
}
</style>
