<template>
  <v-ons-toolbar>
    <div class="left">
      <v-ons-icon
        icon="ion-ios-arrow-back"
        size="lg"
        @click="redirect(option.backUrl || '/')"
        v-if="option.back"
      ></v-ons-icon>
      <!-- {{ option }} -->
    </div>
    <div class="center" v-if="option.title">{{ option.title }}</div>
    <div class="right">
      <button v-if="option.notification" @click="redirect()">
        <v-ons-icon icon="ion-ios-notifications-outline" size="lg"></v-ons-icon>
      </button>
      <button v-if="option.menu"  @click="toggleSetting">
        <v-ons-icon icon="ion-ios-menu" size="lg"></v-ons-icon>
      </button>
      <button v-if="option.addFriend" @click="onAddFriend" class="add-friend-button">
        <v-ons-icon icon="ion-ios-add-circle" size="lg"></v-ons-icon>
      </button>
    </div>

    <v-ons-modal :visible="settingVisible">
      <button class="close-setting-button">
        <v-ons-icon icon="ion-ios-close" size="lg" @click="toggleSetting" v-if="option.menu"></v-ons-icon>
      </button>
      <div class="setting-container">
        <h1 class="setting-title">Settings</h1>
        <ul>
          <li>General</li>
          <li @click="redirect('/proposal/new/change')">Change network parameter</li>
          <li @click="redirect('/proposal/new/feature')">Propose develpment fund</li>
          <li @click="redirect('/setting/export')">Export Account</li>
          <li @click="redirect('/setting/friends')">Friends</li>
          <li @click="redirect('/setting/network')">Network</li>
          <li @click="onSignOut">Sign Out</li>
        </ul>
      </div>
    </v-ons-modal>
  </v-ons-toolbar>
</template>
<script>
import Title from "~/components/baisc/Title";
import { mapGetters, mapActions } from "vuex";
import utils from '../assets/utils';

export default {
  components: { Title },
  props: {
    option: {
      type: Object,
      default: {
        notification: false,
        profile: false,
        back: false,
        menu: false,
        backUrl: "/",
        addFriend: null
      }
    }
  },
  data: function() {
    return {
      settingVisible: false
    };
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState",
      isUIReady: "chat/isUIReady"
    })
  },
  methods: {
    ...mapActions({
      updateAppState: "chat/updateAppState",
      removeWallet: "wallet/removeWallet"
    }),
    redirect(url = "/") {
      this.$router.push(url);
    },
    toggleSetting() {
      this.settingVisible = !this.settingVisible;
    },
    onSignOut() {
      this.updateAppState(null);
      this.removeWallet();
      localStorage.removeItem("account");
      this.$router.push("/welcome");
      window.location.reload(false);
    },
    onAddFriend() {
      let handle = this.option.addFriend;
      console.log(handle)
      if (!handle) return
      this.$ons.notification
        .confirm(`Confirm to add @${handle} to friend list ?`)
        .then(result => {
          if (result === 1) {
            utils.addFriend(handle, this.getWallet.entry.keys);
          }
        });
    }
  }
};
</script>
<style scoped>
.toolbar__title {
  font-family: Poppins;
  font-size: 20px;
  color: #0a2463;
  letter-spacing: 0;
  text-align: center;
}
.toolbar {
  background: #fbfbfb;
  margin-bottom: 15px;
  height: 75px;
  align-items: center;
}
.toolbar__right {
  margin-right: 20px;
}
.toolbar__right button {
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
  border-radius: 20px;
  border: none;
  outline: none;
}

.toolbar__right .add-friend-button {
  background: transparent;
    box-shadow: none;
    font-size: 18px;
    color: #1f3771;
}
.toolbar__right .ion-ios-notifications-outline:before {
  font-size: 30px;
}
.toolbar__right .ion-ios-menu:before {
  font-size: 30px;
}
.ion-ios-close:before {
  font-size: 30px;
}
.modal__content {
  background: #fff;
}
.setting-container {
  position: absolute;
  top: 100px;
}
.setting-title {
  font-family: Poppins;
  font-size: 28px;
  color: #0a2463;
  letter-spacing: 0;
  text-align: left;
}
.close-setting-button {
  position: absolute;
  top: 20px;
  right: 20px;
  border-radius: 20px;
  width: 40px;
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
  height: 40px;
}
</style>