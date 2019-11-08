<template>
  <v-ons-page>
    <tool-bar :option="{ menu: true, notification: true, back: true}" />
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

      <form class="network-form" v-on:submit.prevent="onUpdateSeedNode">
        <p class="sub-head">Change Seed Node</p>
        <input type="text" placeholder="New ip address" v-model="newIP" class="text-input" />
        <input type="text" placeholder="New port number" v-model="newPort" class="text-input" />
        <Button text="Update Network" :onClick="onUpdateSeedNode" />
      </form>
      <v-ons-button
        class="new-message-btn"
        modifier="quiet"
        @click="onResetNetwork"
      >Reset to Default Network</v-ons-button>
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
import { mapGetters, mapActions } from "vuex";
import CONFIG from "../../config";
import utils from "../../assets/utils";
import ToolBar from "~/components/ToolBar";
import Title from "~/components/baisc/Title";
import Button from "~/components/baisc/Button";

Vue.use(VueOnsen);
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c));

export default {
  components: {
    Title,
    Button,
    ToolBar
  },
  data: function() {
    return {
      newPort: "",
      previousUrl: "/",
      newIP: "",
      seedNode: CONFIG.server
    };
  },
  computed: {
    ...mapGetters({
      getNetwork: "chat/getNetwork"
    })
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.previousUrl = from.path;
      console.log(vm.previousUrl);
    });
  },
  methods: {
    ...mapActions({
      updateNetwork: "chat/updateNetwork"
    }),
    redirect(url, option) {
      console.log(`Pushing to ${url}`);
      this.$router.push(url);
      if (url === "/" && option) {
      }
    },
    onUpdateSeedNode() {
      console.log("Updating Seednode and network");
      utils.updateSeedNodeHost(this.newIP, this.newPort);
      this.seedNode = {
        ip: this.newIP,
        port: this.newPort
      };
      this.updateChatServerHost();
      this.newIP = "";
      this.newPort = "";
    },
    async updateChatServerHost() {
      console.log("Updating chat server host...");
      let randomHost = await utils.getRandomHost();
      this.updateNetwork(randomHost);
      utils.updateHost(`${randomHost.ip}:${randomHost.port}`);
    },
    async onResetNetwork() {
      console.log("Resetting Seednode and network");
      utils.updateSeedNodeHost(CONFIG.server.ip, CONFIG.server.port);
      this.seedNode = CONFIG.server;
      this.updateChatServerHost();
      this.newIP = "";
      this.newPort = "";
    }
  }
};
</script>

<style>
.network-container {
  width: 90%;
  max-width: 600px;
  margin: 20px auto;
  text-align: center;
}
.network-container p {
  text-align: left;
  margin-bottom: 10px;
  font-family: Poppins-Medium;
  font-size: 14px;
  color: #333333;
  letter-spacing: -0.16px;
  text-align: left;
}
.network-container .sub-head {
  font-family: Poppins-Regular;
  font-size: 15px;
  color: #0a2463;
  letter-spacing: 0;
}
.network-container p span {
  font-family: Inconsolata-Regular;
  font-size: 18px;
  color: #333333;
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
