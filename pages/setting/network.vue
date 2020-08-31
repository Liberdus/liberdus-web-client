<template>
  <div>
    <!-- <tool-bar
      :option="{
        menu: false,
        notification: false,
        back: true,
        backUrl: previousUrl
      }"
    /> -->
    <div v-if="checkingSeedNode" class="checking-container">
      <v-ons-progress-circular indeterminate />
      <p class="body">
        Checking seed node
      </p>
    </div>
    <div v-else class="network-container">
      <a-card title="Change Seed Node">
        <a-descriptions title="Current Seed Node Info" bordered>
          <a-descriptions-item v-if="seedNode" label="Node Ip">
            {{ seedNode.ip }}
          </a-descriptions-item>
          <a-descriptions-item v-else label="Node Ip"> </a-descriptions-item>

          <a-descriptions-item v-if="seedNode" label="Node Port">
            {{ seedNode.port }}
          </a-descriptions-item>
          <a-descriptions-item v-else label="Node Port"> </a-descriptions-item>
        </a-descriptions>

        <form class="network-form">
          <a-input
            v-model="newIP"
            type="text"
            placeholder="New ip address"
            size="large"
            style="margin-top:20px"
          />
          <a-input
            v-model="newPort"
            type="text"
            placeholder="New port number"
            size="large"
            style="margin-top:20px"
          />
          <a-button
            @click="onUpdateSeedNode"
            size="large"
            type="primary"
            shape="round"
            style="margin-top:20px"
          >
            Update Network
          </a-button>
        </form>
        <v-ons-button
          class="new-message-btn"
          modifier="quiet"
          @click="onResetNetwork"
        >
          Reset to Default Network
        </v-ons-button>

        <p style="text-align: center">
          <nuxt-link class="link-to-import" to="/welcome">
            <strong> Back to Sign In page</strong>
          </nuxt-link>
        </p>
      </a-card>
      <!-- <p v-if="seedNode">
        Current Seed Node IP:
        <span>{{ seedNode.ip }}</span>
      </p>
      <p v-else>
        Current Seed Node IP:
      </p>

      <p v-if="seedNode">
        Current Seed Node PORT:
        <span>{{ seedNode.port }}</span>
      </p>
      <p v-else>
        Current Seed Node PORT:
      </p> -->
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
import { mapGetters, mapActions } from 'vuex';
import CONFIG from '../../config';
import utils from '../../assets/utils';
import ToolBar from '~/components/ToolBar';
import Title from '~/components/baisc/Title';
import Button from '~/components/baisc/Button';
const defaultSeedNode = Object.assign({}, CONFIG.server);

console.log(`default`, defaultSeedNode);

Vue.use(VueOnsen);
Object.values(OnsenComponents).forEach((c) => Vue.component(c.name, c));

export default {
  layout: 'dashboard',
  components: {
    Title,
    Button,
    ToolBar,
  },
  data: function() {
    return {
      newPort: '',
      previousUrl: '/',
      newIP: '',
      seedNode: {
        ip: '',
        port: '',
      },
      defaultSeedNode,
      checkingSeedNode: false,
    };
  },
  computed: {
    ...mapGetters({
      getNetwork: 'chat/getNetwork',
    }),
    currentSeedNode() {
      return this.getNetwork;
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.previousUrl = from.path;
      console.log(vm.previousUrl);
    });
  },
  mounted: function() {
    let self = this;
    const defaultSeedNodeHost = `${CONFIG.server.ip}:${CONFIG.server.port}`;
    const storedSeedNodeHost = localStorage.getItem('seednode');
    const seedNodeHost = storedSeedNodeHost || defaultSeedNodeHost;
    this.seedNode = utils.getCurrentSeedNode(seedNodeHost);
  },
  methods: {
    ...mapActions({
      updateNetwork: 'chat/updateNetwork',
      updateAppState: 'chat/updateAppState',
      removeWallet: 'wallet/removeWallet',
    }),
    redirect(url, option) {
      console.log(`Pushing to ${url}`);
      this.$router.push(url);
      if (url === '/' && option) {
      }
    },
    async onUpdateSeedNode(e) {
      e.preventDefault();
      this.checkingSeedNode = true;
      const isSeedNodeOnline = await utils.isSeedNodeOnline(
        this.newIP,
        this.newPort
      );
      if (isSeedNodeOnline) {
        console.log('Updating Seednode and network');
        utils.updateSeedNodeHostLocally(this.newIP, this.newPort);
        this.seedNode.ip = this.newIP;
        this.seedNode.port = this.newPort;

        this.updateChatServerHost();
        setTimeout(() => {
          this.newIP = '';
          this.newPort = '';
        }, 1000);
        // this.$ons.notification.alert('Seed node server is updated.')
        // this.checkingSeedNode = false
        // if (this.previousUrl === '/welcome') {
        //   this.$router.push('/loading')
        // } else {
        //   this.signOut()
        // }
        this.signOut();
      } else {
        this.$ons.notification.alert('Provided seed node is not online.');
      }
      this.checkingSeedNode = false;
    },
    signOut() {
      this.updateAppState(null);
      this.removeWallet();
      this.$router.push('/');
      setTimeout(() => {
        window.location.reload(false);
      }, 500);
    },
    async updateChatServerHost() {
      console.log('Updating chat server host...');
      let randomHost = await utils.getRandomHost();
      randomHost.timestamp = Date.now();
      this.updateNetwork(randomHost);
      utils.updateHost(`${randomHost.ip}:${randomHost.port}`);
    },
    async onResetNetwork() {
      console.log('Resetting Seednode and network');
      this.seedNode.ip = this.defaultSeedNode.ip;
      this.seedNode.port = this.defaultSeedNode.port;
      utils.updateSeedNodeHostLocally(
        this.defaultSeedNode.ip,
        this.defaultSeedNode.port
      );
      this.updateChatServerHost();
      this.newIP = '';
      this.newPort = '';
      this.$ons.notification.alert('Seed node server is reset to default.');
    },
  },
};
</script>

<style lang="scss">
.checking-container {
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
.network-container {
  width: 90%;
  max-width: 600px;
  margin: 20px auto;
  margin-top: 80px;
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
