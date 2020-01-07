<template>
  <v-ons-toolbar>
    <div class="left">
      <button v-if="option.back" @click="redirect(option.backUrl || '/')">
        <v-ons-icon icon="ion-ios-arrow-back" size="lg"></v-ons-icon>
      </button>
      <img v-else src="../assets/images/loading-logo.png" class="main-logo" />
    </div>
    <div class="center" v-if="option.title">{{ option.title }}</div>
    <div class="right">
      <div v-if="option.notification && getWallet" class="user-alias">
        @{{ getWallet.handle }}
      </div>
      <button v-if="option.notification" @click="toggleNotification">
        <v-ons-icon icon="ion-ios-notifications-outline" size="lg"></v-ons-icon>
      </button>
      <button v-if="option.menu" @click="toggleSetting">
        <v-ons-icon icon="ion-ios-menu" size="lg"></v-ons-icon>
      </button>
      <button
        v-if="option.addFriend"
        @click="onAddFriend"
        class="add-friend-button"
      >
        <v-ons-icon icon="ion-ios-add-circle" size="lg"></v-ons-icon>
      </button>
    </div>

    <v-ons-modal :visible="settingVisible">
      <button class="close-setting-button">
        <v-ons-icon
          icon="ion-ios-close"
          size="lg"
          @click="toggleSetting"
          v-if="option.menu"
        ></v-ons-icon>
      </button>
      <div class="setting-container">
        <h1 class="setting-title">Settings</h1>
        <ul>
          <li>General</li>
          <li @click="redirect('/setting/export')">Export Account</li>
          <li @click="redirect('/setting/toll')">Toll</li>
          <li @click="redirect('/setting/friends')">Friends</li>
          <li @click="redirect('/setting/network')">Network</li>
          <li @click="onSignOut">Sign Out</li>
        </ul>
      </div>
    </v-ons-modal>
    <v-ons-modal :visible="notificationVisible">
      <button class="close-setting-button">
        <v-ons-icon
          icon="ion-ios-close"
          size="lg"
          @click="toggleNotification"
          v-if="option.menu"
        ></v-ons-icon>
      </button>
      <div class="setting-container">
        <h1 class="setting-title">Notifications</h1>
        <ul>
          <li v-for="noti in notificationQueue" :key="noti.id">
            <div class="notification-item">
              <p class="time">{{ formatTimestamp(noti.timestamp) }}</p>
              <h6 class="title">{{ noti.title }}</h6>
              <p class="text">{{ noti.text }}</p>
            </div>
          </li>
        </ul>
      </div>
    </v-ons-modal>
  </v-ons-toolbar>
</template>
<script>
import Title from '~/components/baisc/Title'
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import utils from '../assets/utils'

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
        backUrl: '/',
        addFriend: null
      }
    }
  },
  data: function () {
    return {
      settingVisible: false,
      notificationVisible: false
    }
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      isUIReady: 'chat/isUIReady',
      getNotificationQueue: 'chat/getNotificationQueue'
    }),
    notificationQueue () {
      let queue = [...this.getNotificationQueue]
      return queue.sort((a, b) => b.timestamp - a.timestamp)
    }
  },
  methods: {
    ...mapActions({
      updateAppState: 'chat/updateAppState',
      removeWallet: 'wallet/removeWallet'
    }),
    formatTimestamp (ts) {
      return moment(ts).calendar()
    },
    redirect (url = '/') {
      this.$router.push(url)
    },
    toggleSetting () {
      this.settingVisible = !this.settingVisible
    },
    toggleNotification () {
      this.notificationVisible = !this.notificationVisible
    },
    onSignOut () {
      this.updateAppState(null)
      this.removeWallet()
      localStorage.removeItem('account')
      localStorage.removeItem('lastMessage')
      localStorage.removeItem('lastTx')
      this.$router.push('/welcome')
      window.location.reload(false)
    },
    onAddFriend () {
      let handle = this.option.addFriend
      if (!handle) return
      if (handle === this.getWallet.handle) {
        this.$ons.notification.alert('You cannot add yourself as friend.')
      } else {
        this.$ons.notification
          .confirm(`Confirm to add @${handle} to friend list ?`)
          .then(result => {
            if (result === 1) {
              utils.addFriend(handle, this.getWallet.entry.keys)
            }
          })
      }
    }
  }
}
</script>
<style scoped lang="scss">
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
.toolbar__left {
  .main-logo {
    height: 40px;
  }
  button {
    background: #ffffff;
    box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
    border-radius: 20px;
    border: none;
    outline: none;
    cursor: pointer;
    width: 43px;
    height: 43px;
    padding: 10px;
    .ons-icon {
      font-size: 22px;
    }
  }
  img {
    position: relative;
    top: 7px;
  }
}
.toolbar__right {
  margin-right: 20px;
  display: flex;
  justify-content: flex-end;
  width: 50%;
  .user-alias {
    color: #0a2463;
    font-family: 'Poppins';
    font-size: 14px;
  }
  button {
    background: #ffffff;
    box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
    border-radius: 20px;
    border: none;
    outline: none;
    cursor: pointer;
    margin: 0px 5px;
    width: 43px;
    height: 43px;
  }
  .add-friend-button {
    background: transparent;
    box-shadow: none;
    font-size: 18px;
    color: #1f3771;
  }
  .ion-ios-notifications-outline:before {
    font-size: 30px;
  }
  .ion-ios-menu:before {
    font-size: 30px;
  }
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
  width: 90%;
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
.notification-item {
  box-shadow: 0px 2px 5px #d3d3d3;
  padding: 10px;
  width: 90%;
  border-radius: 10px;
  .time {
    font-size: 11px;
    margin-bottom: 10px;
    color: #3178c5;
  }
  .title {
    font-size: 14px;
    font-weight: lighter;
  }
  .text {
    font-size: 13px;
    font-weight: bolder;
  }
}
@media screen and (max-width: 400px) {
  .toolbar__left .main-logo {
    height: 25px;
  }
}
</style>
