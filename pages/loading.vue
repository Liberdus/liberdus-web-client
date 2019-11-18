<template >
  <v-ons-page>
    <div id="loading-container">
      <img id="loading-logo" src="../assets/images/loading-logo.png" alt />
      <!-- <v-ons-progress-bar indeterminate></v-ons-progress-bar> -->
    </div>
  </v-ons-page>
</template>

<script>
import Vue from "vue";
import "onsenui/css/onsenui.css";
import "onsenui/css/onsen-css-components.css";
import VueOnsen from "vue-onsenui/esm";
import OnsenComponents from "~/components/Onsen";
import utils from "../assets/utils";
import { mapGetters, mapActions } from "vuex";
import CONFIG from "../config";
let defaultHost = `${CONFIG.server.ip}:9001`;

Vue.use(VueOnsen);
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c));
export default {
  data() {
    return {
      host: defaultHost
    };
  },

  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      isUIReady: "chat/isUIReady"
    })
  },
  methods: {
    ...mapActions({
      addWallet: "wallet/addWallet",
      setUIReady: "chat/setUIReady",
      updateNetwork: "chat/updateNetwork"
    })
  },
  async mounted() {
    let self = this;
    console.log("initiating...");
    // let randomHost = await utils.getRandomHost()
    // this.host = `${randomHost.ip}:${randomHost.port}`
    // this.updateNetwork({
    //   ip: randomHost.ip,
    //   port: randomHost.port
    // });
    utils.init(this.host).then(hash => {
      console.log(`Crypto Library is initialised.`);
      console.log(hash);
      self.setUIReady();
      //   self.$router.push("/");
    });
    setTimeout(() => {
      if (self.isUIReady) {
        if (this.getWallet) self.$router.push("/?tabIndex=0");
        else self.$router.push("/welcome");
      }
    }, 2000);
    setTimeout(() => {
      if (this.getWallet) self.$router.push("/?tabIndex=0");
      else self.$router.push("/welcome");
    }, 5000);
  }
};
</script>

<style>
#loading-container {
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
}
#loading-container p {
  margin: 20px;
  font-size: 24px;
  font-weight: normal;
}
#loading-container ons-progress-bar {
  width: 70%;
}
#loading-logo {
  width: 284px;
}
</style>
