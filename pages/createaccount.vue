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
        <Title text="Sign In or Create Account" />
        <p class="text-body">
          Enter your username to sign in existing account or create a new one
        </p>
        <div class="create-username-input-container">
          <input
            type="text"
            ref="usenameInput"
            placeholder="Username"
            v-model="username"
            class="text-input"
            v-on:keyup="loadAccount"
            autocorrect="off"
            autocomplete="off"
            autocapitalize="off"
          />

          <div v-if="!allowSignIn">
            <p
              class="input-error-message"
              v-if="$v.username.required && !$v.username.alphaNum"
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
        </div>
        <Button
          v-if="existingValidAccount"
          text="Sign In"
          :onClick="onSignIn"
        />
        <Button
          v-else
          text="Create Account"
          :onClick="onCreateAccount"
          :isDisabled="!isUsernameValid"
        />
        <p class="already-registered">
          Already registered ? Please import your account
          <nuxt-link class="link-to-import" to="/setting/import"
            ><strong>here</strong></nuxt-link
          >.
        </p>
      </div>
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
import utils from '../assets/utils'
import { mapActions, mapGetters } from 'vuex'
import { required, minLength, alphaNum } from 'vuelidate/lib/validators'
import Title from '~/components/baisc/Title'
import Button from '~/components/baisc/Button'
import ToolBar from '~/components/ToolBar'
import backgroundUrl from '~/assets/images/liberdus_background.png'

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
      allowSignIn: false
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
      let entry = utils.createWallet(this.username)
      let wallet = {
        handle: this.username,
        entry: entry
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
      this.username = this.username.toLowerCase()
      this.checkingUsername = true
      try {
        let address = await utils.getAddress(this.username)
        if (address) {
          let wallets = localStorage.getItem('wallets')
          if (wallets && address === wallets.some(wallet => wallet.address === address)) {
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
      this.checkUsername()
      const localWallet = utils.loadWallet(this.username)
      const lastMessage = utils.loadLastMessage()
      const lastTx = utils.loadLastTx()
      if (localWallet) {
        const remoteAccountAddress = await utils.getAddress(localWallet.handle)
        const localAccountAddress = localWallet.entry.address
        // console.log('Remote address: ', remoteAccountAddress)
        // console.log('Local address: ', localAccountAddress)
        if (remoteAccountAddress === localAccountAddress) {
          this.existingValidAccount = localWallet
          this.allowSignIn = true
        } else {
          this.existingValidAccount = null
          this.allowSignIn = false
        }
      } else {
        console.log('No local wallet found with username: ', this.username)
        this.existingValidAccount = null
        this.allowSignIn = false
      }
    },
    onSignIn () {
      this.addWallet(this.existingValidAccount)
      console.log('Wallet added to vuex store.')
      this.$router.push('/')
      // if (lastMessage) {
      //   console.log('Last message added to vuex store.')
      //   this.updateLastMessage(lastMessage)
      // }
      // if (lastTx) {
      //   console.log('Last tx added to vuex store.')
      //   this.updateLastTx(lastTx)
      // }
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

<style>
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
}

.create-account-container .already-registered {
  font-size: 13px;
  color: #9a9a9a;
  letter-spacing: -0.14px;
  text-align: center;
  margin-top: 15px;
}
.create-account-container .create-account-content {
  max-width: 600px;
}
.create-account-container .create-account-content h3 {
  font-family: 'Poppins';
}
.create-username-input-container {
  margin: 20px auto;
  max-width: 600px;
}
.create-account-container p {
  text-align: left;
}
.create-account-container h3 {
  margin: 30px auto;
}

.create-username-input-container .input-error-message {
  color: red;
  font-weight: normal !important;
}
.create-username-input-container .input-success-message {
  color: green;
}
.create-username-input-container .input-checking-message {
  color: #333;
  font-size: 12px;
  text-align: center;
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
