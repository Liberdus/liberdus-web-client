<template>
  <v-ons-page>
    <tool-bar
      :option="{
        menu: false,
        notification: false,
        back: true,
        backUrl: previousUrl
      }"
    />
    <div class="network-container">
      <p v-if="seedNode">
        Current Seed Node IP:
        <span>{{ seedNode.ip }}</span>
      </p>
      <p v-else>Current Seed Node IP:</p>

      <p v-if="seedNode">
        Current Seed Node PORT:
        <span>{{ seedNode.port }}</span>
      </p>
      <p v-else>Current Seed Node PORT:</p>

      <form class="network-form">
        <p class="sub-head">Change Seed Node</p>
        <input
          type="text"
          placeholder="New ip address"
          v-model="newIP"
          class="text-input"
        />
        <input
          type="text"
          placeholder="New port number"
          v-model="newPort"
          class="text-input"
        />
        <Button text="Update Network" :onClick="onUpdateSeedNode" />
      </form>
      <v-ons-button
        class="new-message-btn"
        modifier="quiet"
        @click="onResetNetwork"
        >Reset to Default Network</v-ons-button
      >
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
import { mapGetters, mapActions } from 'vuex'
import CONFIG from '../../config'
import utils from '../../assets/utils'
import ToolBar from '~/components/ToolBar'
import Title from '~/components/baisc/Title'
import Button from '~/components/baisc/Button'
const defaultSeedNode = Object.assign({}, CONFIG.server)

console.log(`default`, defaultSeedNode)

Vue.use(VueOnsen)
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c))

export default {
  components: {
    Title,
    Button,
    ToolBar
  },
  data: function () {
    return {
      newPort: '',
      previousUrl: '/',
      newIP: '',
      seedNode: {
        ip: '',
        port: ''
      },
      defaultSeedNode
    }
  },
  computed: {
    ...mapGetters({
      getNetwork: 'chat/getNetwork'
    }),
    currentSeedNode () {
      return this.getNetwork
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.previousUrl = from.path
      console.log(vm.previousUrl)
    })
  },
  mounted: function () {
    let self = this

    const defaultSeedNodeHost = `${CONFIG.server.ip}:${CONFIG.server.port}`
    const storedSeedNodeHost = localStorage.getItem('seednode')
    const seedNodeHost = storedSeedNodeHost || defaultSeedNodeHost

    this.seedNode = utils.getCurrentSeedNode(seedNodeHost)
  },
  methods: {
    ...mapActions({
      updateNetwork: 'chat/updateNetwork',
      updateAppState: 'chat/updateAppState',
      removeWallet: 'wallet/removeWallet'
    }),
    redirect (url, option) {
      console.log(`Pushing to ${url}`)
      this.$router.push(url)
      if (url === '/' && option) {
      }
    },
    onUpdateSeedNode (e) {
      e.preventDefault()
      console.log('Updating Seednode and network')
      utils.updateSeedNodeHost(this.newIP, this.newPort)
      this.seedNode.ip = this.newIP
      this.seedNode.port = this.newPort

      this.updateChatServerHost()
      setTimeout(() => {
        this.newIP = ''
        this.newPort = ''
      }, 1000)
      this.$ons.notification.alert('Seed node server is updated.')
      if (this.previousUrl === '/welcome') {
        this.$router.push('/loading')
      } else {
        this.signOut()
      }
    },
    signOut () {
      this.updateAppState(null)
      this.removeWallet()
      // localStorage.removeItem('account')
      // localStorage.removeItem('lastMessage')
      // localStorage.removeItem('lastTx')
      this.$router.push('/loading')
      // window.location.reload(false)
    },
    async updateChatServerHost () {
      console.log('Updating chat server host...')
      let randomHost = await utils.getRandomHost()
      this.updateNetwork(randomHost)
      utils.updateHost(`${randomHost.ip}:${randomHost.port}`)
    },
    async onResetNetwork () {
      console.log('Resetting Seednode and network')
      this.seedNode.ip = this.defaultSeedNode.ip
      this.seedNode.port = this.defaultSeedNode.port
      utils.updateSeedNodeHost(
        this.defaultSeedNode.ip,
        this.defaultSeedNode.port
      )
      this.updateChatServerHost()
      this.newIP = ''
      this.newPort = ''
      this.$ons.notification.alert('Seed node server is reset to default.')
    }
  }
}
</script>

<style lang="scss">
.network-container {
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
  .sub-head {
    font-family: Poppins;
    font-size: 15px;
    color: #0a2463;
    letter-spacing: 0;
  }
  p span {
    font-family: Inconsolata;
    font-size: 18px;
    color: #333333;
  }
}

.network-form {
  margin-top: 15px;
  padding-top: 15px;
}
.network-form div {
  text-align: left;
}
.network-form label {
  font-size: 12px;
  text-align: left;
}
.network-form .network-input {
  height: 40px;
  width: 100%;
  padding: 5px 10px;
  background: #fff;
  border: 1px solid #dddddd;
  border-radius: 5px;
  margin: 20px auto;
  margin-top: 5px;
}
</style>
