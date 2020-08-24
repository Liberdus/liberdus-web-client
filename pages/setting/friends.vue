<template>
  <!-- <v-ons-page> -->
  <div>
    <!-- <tool-bar :option="{ menu: false, notification: false, back: true, title: `Friend Setting`}" /> -->

    <div class="friend-setting-container">
      <div class="new-message-input-container">
        <input
          type="text"
          placeholder="Search a friend"
          class="text-input"
          v-model="queryHandle"
          @keyup="searchAccount"
          autocorrect="off"
          autocomplete="off"
          autocapitalize="off"
        />
      </div>

      <div class="search-result-container">
        <v-ons-card v-if="foundAccount">
          <v-ons-list>
            <v-ons-list-item>
              <div class="found-account">
                <p class="found-handle">@{{ foundAccount.alias }}</p>
                <p class="required-toll">
                  <em>Toll: {{ foundAccount.data.toll }} Coin</em>
                </p>
              </div>
              <v-ons-icon v-if="isFriend" icon="ion-ios-person" size="lg"></v-ons-icon>
              <v-ons-icon
                v-else
                icon="ion-ios-add-circle"
                size="lg"
                @click="onClickAddFriend(foundAccount.alias)"
              ></v-ons-icon>
            </v-ons-list-item>
          </v-ons-list>
        </v-ons-card>
      </div>
      <div class="current-friend-list">
        <h2 class="title-2">My Friend List</h2>
        <v-ons-list v-if="getAppState">
          <v-ons-list-item v-for="alias in getAppState.data.friends" :key="alias">
            <p>@{{ alias }}</p>
            <!-- <v-ons-icon icon="ion-ios-person" size="lg"></v-ons-icon> -->
            <v-ons-icon
              icon="ion-ios-close-circle-outline"
              size="lg"
              @click="onClickRemoveFriend(alias)"
            ></v-ons-icon>
          </v-ons-list-item>
        </v-ons-list>
      </div>
    </div>
  <!-- </v-ons-page> -->
  </div>
</template>

<script>
import Vue from "vue";
import "onsenui/css/onsenui.css";
import "onsenui/css/onsen-css-components.css";
import VueOnsen from "vue-onsenui/esm";
import OnsenComponents from "~/components/Onsen";
import ChatText from "~/components/ChatText";
import ChatInput from "~/components/ChatInput";
import { mapGetters } from "vuex";
import utils from "../../assets/utils";
import ToolBar from "~/components/ToolBar";
import Title from "~/components/baisc/Title";
import Button from "~/components/baisc/Button";

Vue.use(VueOnsen);
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c));

export default {
  layout: 'dashboard',
  components: {
    ChatText,
    ChatInput,
    ToolBar
  },
  data: function() {
    return {
      queryHandle: "",
      foundAccount: null
    };
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState",
      isUIReady: "chat/isUIReady"
    }),
    isFriend() {
      if (!this.foundAccount || !this.getAppState) return false;
      return (
        this.getAppState.data.friends.indexOf(this.foundAccount.alias) >= 0
      );
    }
  },
  methods: {
    redirect(url, option) {
      this.$router.push(url);
      if (url === "/" && option) {
      }
    },

    async searchAccount() {
      if (this.queryHandle) this.queryHandle = this.queryHandle.toLowerCase();
      let queryAccount = await utils.queryAccount(this.queryHandle);
      if (queryAccount.account) {
        console.log(queryAccount.account);
        if (queryAccount.account.alias !== this.getWallet.handle) {
          this.foundAccount = queryAccount.account;
          return;
        }
      }
      this.foundAccount = null;
    },
    onClickAddFriend(handle) {
      let self = this;
      if (handle && handle !== this.getWallet.handle) {
        this.$ons.notification
          .confirm(
            `Confirm to add @${this.foundAccount.alias} to friend list ?`
          )
          .then(result => {
            if (result === 1) {
              utils.addFriend(
                this.foundAccount.alias,
                this.getWallet.entry.keys
              );
              this.queryHandle = "";
              this.foundAccount = null;
            }
          });
      }
    },
    async onClickRemoveFriend(alias) {
      let self = this;
      this.$ons.notification
        .confirm(`Confirm to remove @${alias} from friend list ?`)
        .then(async result => {
          if (result === 1) {
            let isSubmitted = await utils.removeFriend(
              alias,
              this.getWallet.entry.keys
            );
            if (isSubmitted) this.notify("Remove friend tx is submitted.");
          }
        });
    },
    notify(message) {
      this.$ons.notification.alert(message);
    }
  }
};
</script>

<style>
.friend-setting-container {
  width: 90%;
  max-width: 600px;
  margin: 20px auto;
}
.friend-name-input-container {
  height: 70px;
  max-width: 600px;
  margin: 0 auto;
  background: #f2f2f2;
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  z-index: 100;
}
.friend-name-input {
  height: 40px;
  width: 80%;
  padding: 0px 10px;
  background: #fff;
  border: 1px solid #dddddd;
  border-radius: 15px;
  font-size: 16px !important;
}
.current-friend-list {
  max-width: 600px;
  margin: 0 auto;
  margin-top: 30px;
}
.current-friend-list .list-item {
  height: 60px;
  border: none !important;
  background: #fbfbfb;
}
.current-friend-list .list-item p {
  font-size: 18px;
  font-family: "Poppins";
}
.current-friend-list h4 {
  margin-left: 20px;
}
.search-result-container {
  display: flex;
  justify-content: flex-end;
  max-width: 600px;
  margin: 0 auto;
}
.search-result-container .card {
  width: 100%;
  padding: 5px 10px;
}
.search-result-container .card .list {
  background: none;
}
.search-result-container .card .list-item .list-item__center {
  background: none;
  display: flex;
  justify-content: space-between;
}
.current-friend-list .list-item .list-item__center {
  display: flex;
  justify-content: space-between;
  padding-right: 30px;
}
.add-friend-button {
  width: 25px;
  height: 25px;
}
.search-result-container .found-account {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  font-family: Poppins;
  font-size: 16px;
}
.search-result-container .found-account .found-handle {
  font-weight: bold;
}
.search-result-container .found-account .required-toll {
  font-weight: normal;
  font-size: 11px;
}
</style>
