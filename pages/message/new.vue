<template>
  <v-ons-page>
    <tool-bar :option="{ menu: true, notification: true, back: true}" />
    <div class="new-message-input-container">
      <input
        type="text"
        placeholder="Search a username"
        class="text-input"
        v-model="username"
        @keyup="searchHandle"
        autocorrect="off"
        autocomplete="off"
        autocapitalize="off"
      />
    </div>
    <v-ons-list class="found-handle-list">
      <v-ons-list-item v-for="handle in availableHandles" :key="handle">
        <nuxt-link v-bind:to="`/message/${username}`" class="nuxt-link">@{{ handle }}</nuxt-link>
      </v-ons-list-item>
    </v-ons-list>

    <div class="current-friend-list">
      <h2 class="title-2">My Friends</h2>
      <!-- <v-ons-list v-if="getAppState"> -->
      <v-ons-list>
        <nuxt-link
          v-for="handle in ['james', 'michael', 'david']"
          :key="handle"
          v-bind:to="`/message/${handle}`"
          class="nuxt-link"
        >
          <v-ons-list-item>
            <p class="body">@{{ handle }}</p>
            <v-ons-icon icon="ion-ios-contact" size="lg"></v-ons-icon>
          </v-ons-list-item>
        </nuxt-link>
        <!-- <nuxt-link
          v-for="handle in getAppState.data.friends"
          :key="handle"
          v-bind:to="`/message/${handle}`"
          class="nuxt-link"
        >
          <v-ons-list-item>
            <p>@{{ handle }}</p>
            <v-ons-icon icon="ion-ios-person" size="lg"></v-ons-icon>
          </v-ons-list-item>
        </nuxt-link>-->
      </v-ons-list>
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
import utils from "../../assets/utils";
import { mapGetters } from "vuex";
import ToolBar from "~/components/ToolBar";
import Title from "~/components/baisc/Title";
import Button from "~/components/baisc/Button";

Vue.use(VueOnsen);
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c));

export default {
  components: {
    ChatText,
    ChatInput,
    ToolBar,
    Title,
    Button
  },
  validate({ params }) {
    return true;
  },
  data: function() {
    return {
      username: "",
      availableHandles: []
    };
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState",
      isUIReady: "chat/isUIReady"
    }),
    friend() {
      return this.$route.params.friend;
    }
  },
  mounted() {},
  methods: {
    async searchHandle() {
      // if (this.username) this.username = this.username.toLowerCase();
      // let queryAccount = await utils.queryAccount(this.username);
      // if (queryAccount.account)
      //   this.availableHandles = [queryAccount.account.handle];
      // else if (this.username.length === 0) this.availableHandles = [];
      if (this.username)
        this.availableHandles = ["osyed", "thant", "asyed", "kyle", "andrew"];
      else this.availableHandles = [];
    }
  }
};
</script>

<style>
.new-message-input-container {
  height: 70px;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90%;
  max-width: 600px;
  z-index: 100;
  margin: 20px auto;
}
.new-message-input {
  height: 40px;
  width: 90%;
  max-width: 600px;
  padding: 5px 10px;
  background: #fff;
  border: 1px solid #dddddd;
  border-radius: 5px;
}
.current-friend-list {
  padding: 20px;
  width: 90%;
  max-width: 600px;
  margin: 20px auto;
}
.current-friend-list .list-item {
  background: #fbfbfb;
  border: none;
}
.current-friend-list .list-item .ons-icon {
  font-size: 30px;
  color: #0a2463;
}
.current-friend-list .list-item .list-item__center {
  display: flex;
  justify-content: space-between;
}
.found-handle-list {
  border: none;
  background: transparent;
}
.found-handle-list .list-item {
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
  border-radius: 5px;
  margin: 10px auto;
  width: 100%;
  max-width: 600px;
}
</style>
