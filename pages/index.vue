<template >
  <v-ons-page>
    <notifications
      group="new-message"
      position="bottom left"
      width="100%"
      classes="my-notification-style"
    />
    <tool-bar :option="{ menu: true, notification: true, back: false}" />
    <v-ons-tabbar swipeable position="top" :tabs="tabs" :visible="true" :index.sync="activeIndex"></v-ons-tabbar>
  </v-ons-page>
</template>

<script>
import Vue from "vue";
import "onsenui/css/onsenui.css";
import "onsenui/css/onsen-css-components.css";
import VueOnsen from "vue-onsenui/esm";
import OnsenComponents from "~/components/Onsen";
import Message from "~/components/Message";
import ToolBar from "~/components/ToolBar";
import Home from "~/components/Home";
import ProposalList from "~/components/ProposalList";
import Funding from "~/components/Funding";
import Setting from "~/components/Setting";
import utils from "../assets/utils";
import { mapGetters, mapActions } from "vuex";
import Vuelidate from "vuelidate";
import { required, minLength, between } from "vuelidate/lib/validators";
import Notifications from "vue-notification";

Vue.use(Vuelidate);
Vue.use(VueOnsen);
Vue.use(Notifications);
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c));

export default {
  components: {
    Message,
    Home,
    Setting,
    ProposalList,
    Funding,
    ToolBar
  },
  data() {
    return {
      activeIndex: 0,
      tabs: [
        {
          icon: this.md() ? null : "ion-ios-home",
          label: "Home",
          page: Home,

          key: "home"
        },
        {
          icon: this.md() ? null : "ion-ios-filing",
          label: "Funding",
          page: Funding,
          key: "funding"
        },
        {
          icon: this.md() ? null : "ion-ios-people",
          label: "Economy",
          page: ProposalList,
          key: "economy"
        },
        {
          icon: this.md() ? null : "ion-ios-chatboxes",
          label: "Message",
          page: Message,
          key: "message"
        }
      ]
    };
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (!from || !from.name) return;
      vm.prevRoute = from;
      console.log(from);
      if (to && to.query.tabIndex) {
        vm.activeIndex = parseInt(to.query.tabIndex);
      } else if (from.name.split("-")[0] === "proposal") {
        vm.activeIndex = 1;
      } else if (from.name.split("-")[0] === "message") {
        vm.activeIndex = 3;
      } else if (from.name.split("-")[0] === "wallet") {
        vm.activeIndex = 0;
      }
    });
  },
  methods: {
    ...mapActions({
      updateAppState: "chat/updateAppState",
      updateLastMessage: "chat/updateLastMessage",
      updateLastTx: "chat/updateLastTx",
      setUIReady: "chat/setUIReady",
      addWallet: "wallet/addWallet",
      updateActiveProposals: "proposal/updateActiveProposals",
      updateCompletedProposals: "proposal/updateCompletedProposals",
      updateActiveDevProposals: "proposal/updateActiveDevProposals",
      updateCompletedDevProposals: "proposal/updateCompletedDevProposals"
    }),
    md() {
      return this.$ons.platform.isAndroid();
    }
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState",
      getLastMessage: "chat/getLastMessage",
      getLastTx: "chat/getLastTx",
      isUIReady: "chat/isUIReady",
      getActiveProposals: "proposal/getActiveProposals",
      getCompletedProposals: "proposal/getCompletedProposals",
      getActiveDevProposals: "proposal/getActiveDevProposals",
      getCompletedDevProposals: "proposal/getCompletedDevProposals"
    }),
    title() {
      return this.tabs[this.activeIndex].label;
    }
  },
  async mounted() {
    let self = this;
    if (!this.isUIReady) {
      this.$router.push("/loading");
      // return;
    }
    if (!this.getWallet) {
      const wallet = utils.loadWallet();
      const lastMessage = utils.loadLastMessage();
      const lastTx = utils.loadLastTx();
      if (wallet) {
        this.addWallet(wallet);
        console.log("Wallet added to vuex store.");
      }
      if (lastMessage) {
        console.log("Last message added to vuex store.");
        this.updateLastMessage(lastMessage);
      }
      if (lastTx) {
        console.log("Last tx added to vuex store.");
        this.updateLastTx(lastTx);
      }
    }

    // let checkServerStatus = setInterval(async () => {
    //   try {
    //     let shouldUpdate = false;
    //     let isServerActive = await utils.isServerActive();
    //     if (!isServerActive) shouldUpdate = true;
    //     else {
    //       let lastUpdatedTimestamp = this.getNetwork.timestamp;
    //       if (lastUpdatedTimestamp < Date.now() - 120000) shouldUpdate = true;
    //     }
    //     console.log(`Should update server: ${shouldUpdate}`);

    //     if (shouldUpdate) {
    //       let randomHost = await utils.getRandomHost();
    //       console.log("Updating Network");
    //       self.updateNetwork(randomHost);
    //       utils.updateHost(`${randomHost.ip}:${randomHost.port}`);
    //     }
    //   } catch (e) {
    //     console.warn(e);
    //   }
    // }, 120000);
  }
};
</script>

<style lang="scss">
#main {
  height: 100vh;
}
.page__background {
  background-color: #fbfbfb;
}
.username-input {
  height: 40px;
  width: 90%;
  max-width: 250px;
  padding: 5px 10px;
  background: #fff;
  border: 1px solid #dddddd;
  border-radius: 5px;
  margin: 20px;
}
h1 {
  font-size: 27px;
  color: #333;
  margin: 30px;
}
.default-btn {
  background: #43b8e7;
  border-radius: 30px;
  padding: 5px;
  font-weight: bolder;
  font-size: 13px;
  width: 160px;
  text-align: center;
  cursor: pointer;
}
.toolbar__center {
  text-align: center;
}

.my-notification-style {
  width: 100%;
  padding: 10px;
  margin: 0 5px 5px;
  border-left: 5px solid #187fe7;
  background: rgb(245, 245, 245);
}
.my-notification-style .notification-title {
  font-size: 13px;
  font-weight: bold;
  color: #0076ff;
}

.my-notification-style .notification-content {
  font-size: 12px;
  font-weight: normal;
  color: #333;
  margin-top: 5px;
}
.text-body {
  font-family: Poppins;
  font-size: 16px;
  color: #0a2463;
  letter-spacing: 0;
  line-height: 20px;
}
.select {
  width: 100% !important;
  min-width: 300px;
}
.text-input {
  background: #ffffff;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.08), 0 4px 8px 0 rgba(0, 0, 0, 0.08);
  border-radius: 30px;
  font-family: Poppins;
  font-size: 14px;
  color: #484848;
  letter-spacing: 0.17px;
  line-height: 20px;
  width: 100%;
  height: 48px;
  padding: 0px 20px;
  min-width: 300px;
  margin: 10px auto;
}
.tabbar--top__content {
  top: 100px;
}
.tabbar {
  background: #ffffff;
  height: 64px;
  border: none;
  border-bottom: 1px solid #e8e8e8;
  border-top: 1px solid #e8e8e8;
  margin-bottom: 20px;
  box-shadow: none;
  .tabbar__item {
    height: 64px;

    .tabbar__button {
      height: 64px;
      cursor: pointer;
    }
  }
}
.toolbar + .page__background {
  top: 75px;
}
.toolbar + .page__background + .page__content {
  top: 75px;
  width: 100vw;
  overflow-x: hidden;
}
.modal__content {
  background: #fff;
  font-family: Poppins;
  font-size: 20px;
  color: #0a2463;
  letter-spacing: 0;
  text-align: left;
}
.modal__content ul {
  list-style: none;
}
.modal__content ul > li {
  cursor: pointer;
  margin-bottom: 15px;
}
.select-input {
  width: 100%;
  min-width: 300px;
  height: 40px;
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
  border-radius: 20px;
  padding: 10px;
  font-family: Poppins;
  font-size: 14px;
  color: #0a2463;
  letter-spacing: 0;
  line-height: 20px;
  padding-left: 20px;
}
.title-2 {
  font-family: Poppins !important;
  font-size: 22px !important;
  color: #0a2463;
  letter-spacing: 0;
}
.label {
  font-family: Poppins;
  font-size: 11px;
  color: #6a6969;
  letter-spacing: 0;
  line-height: 20px;
}
.value {
  font-family: Poppins;
  font-size: 12px;
  color: #0a2463;
  letter-spacing: 0;
  line-height: 20px;
}
.progress-bar {
  height: 10px;
  border-radius: 10px;
  background-color: #d8d8d8;
}
.progress-bar__primary,
.progress-bar__secondary {
  background-color: #2648d8;
}
</style>
