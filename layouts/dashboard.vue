<template>
  <a-layout id="components-layout-demo-responsive">
    <a-layout-sider
      breakpoint="lg"
      collapsed-width="0"
      @collapse="onCollapse"
      @breakpoint="onBreakpoint"
      v-model="collapsed"
      v-if="getWallet"
    >
      <div class="header-logo">
        <a-row
          type="flex"
          align="middle"
          :gutter="16"
        >
          <a-col flex="30px">
            <img
              src="icon.png"
              class="main-logo"
            >
          </a-col>

          <a-col flex="auto">
            Liberdus
          </a-col>
        </a-row>
      </div>

      <a-menu 
        theme="dark" 
        mode="inline" 
        :default-selected-keys="['home']"
        :default-open-keys="['settings']"
      >
        <a-menu-item
          key="home"
          @click="redirect('/')"
        >
          <a-icon type="home" />
          <span class="nav-text">Home</span>
        </a-menu-item>

        <a-menu-item
          key="message"
          @click="redirect('/message')"
        >
          <a-icon type="message" />
          <span class="nav-text">Message</span>
        </a-menu-item>

        <a-menu-item
          key="funding"
          @click="redirect('/funding')"
        >
          <a-icon type="fund" />
          <span class="nav-text">Funding</span>
        </a-menu-item>

        <a-menu-item
          key="economy"
          @click="redirect('/economy')"
        >
          <a-icon type="check-square" />
          <span class="nav-text">Economy</span>
        </a-menu-item>

        <a-menu-item
          key="friends"
          @click="redirect('/setting/friends')"
        >
          <a-icon type="usergroup-add" />
          <span class="nav-text">Friends</span>
        </a-menu-item>

        <a-menu-item
          key="stake"
          @click="redirect('/setting/stake')"
        >
          <a-icon type="dollar" />
          <span class="nav-text">Stake</span>
        </a-menu-item>

        <a-sub-menu key="settings">
          <span slot="title"><a-icon type="setting" />Settings</span>
          <a-menu-item
            key="network"
            @click="redirect('/setting/network')"
          >
            <a-icon type="wifi" />
            <span class="nav-text">Network</span>
          </a-menu-item>

          <a-menu-item
            key="toll"
            @click="redirect('/setting/toll')"
          >
            <a-icon type="share-alt" />
            <span class="nav-text">Toll</span>
          </a-menu-item>
        </a-sub-menu>

        <a-menu-item
          key="about"
          @click="redirect('/setting/about')"
        >
          <a-icon type="pic-left" />
          <span class="nav-text">About</span>
        </a-menu-item>

        <a-menu-item
          key="sign-out"
          @click="onSignOut"
        >
          <a-icon type="logout" />
          <span class="nav-text">Sign out</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout class="main-layout">
      <a-layout-header :style="{ background: '#fff', padding: 0 }" class="header-toolbar">
        <div class="header-logo-mobile">
          <a-row
            type="flex"
            align="middle"
            :gutter="16"
          >
            <a-col flex="30px">
              <img
                src="icon.png"
                class="main-logo"
              >
            </a-col>

            <a-col flex="auto">
              <span style="header-logo-text">Liberdus</span>
            </a-col>
          </a-row>
        </div>

        <a-dropdown placement="bottomRight" v-if="getWallet">
          <!-- <a-avatar
            shape="square"
            size="large"
            :style="{ backgroundColor: '#87d068', verticalAlign: 'middle' }"
          >
            {{ getWallet ? getWallet.handle : "No User" }}
          </a-avatar> -->
          <span class="username-container">
            <a-avatar style="backgroundColor:#87d068" icon="user" />
            <span>{{ getWallet ? getWallet.handle : "No User" }}</span>
          </span>

          <a-menu slot="overlay">
            <a-menu-item @click="redirect('/setting/export')">
              <a-icon type="user" />
              @{{ getWallet ? getWallet.handle : "No User" }}
            </a-menu-item>
            <a-menu-item @click="redirect('/email/register')">
              <a-icon type="mail" />
              Register Email
            </a-menu-item>
            <a-menu-item @click="onSignOut">
              <a-icon type="logout" />
              Sign Out
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </a-layout-header>

      <a-layout-content :style="{ margin: '10px 16px 0' }">

        <portal-target name="navigation-tags" class="navigation-tags"></portal-target>

        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
          <nuxt />
        </div>
      </a-layout-content>

      <a-layout-footer style="textAlign: center">
        Liberdus ©2020 Created by Shardus team
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script>
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import PortalVue from 'portal-vue'
import utils from '../assets/utils'

Vue.use(PortalVue)
export default {
  props: {
    option: {
      type: Object,
      default: function() {
        return {
          notification: false,
          profile: false,
          back: false,
          menu: false,
          backUrl: '/',
          addFriend: null
        }
      }
    }
  },
  data: function () {
    return {
      settingVisible: false,
      notificationVisible: false,
      collapsed: true,
      isMobile: false,
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
  beforeMount: function() {
    // if (!this.isUIReady) {
    //   console.log('beforeMount')
    //   this.$router.push('/loading')
    // }
  },
  methods: {
    ...mapActions({
      updateAppState: 'chat/updateAppState',
      removeWallet: 'wallet/removeWallet'
    }),
    onCollapse(collapsed, type) {
      console.log(collapsed, type);
      this.collapsed = collapsed
    },
    onBreakpoint(broken) {
      console.log(broken);
      this.isMobile = broken;
    },
    redirect (url = '/') {
      this.$router.push(url)
      if (this.isMobile) {
        this.collapsed = true
      }
    },
    onSignOut () {
      let handle = this.getWallet.handle
      this.updateAppState(null)
      // this.removeWallet()
      let existingWalletList
      try {
        existingWalletList = JSON.parse(localStorage.getItem('wallets'))
        if (existingWalletList) {
          let filteredList = existingWalletList.filter(w => w.handle !== handle)
          console.log(filteredList)
          // localStorage.setItem('wallets', JSON.stringify(filteredList))
          localStorage.removeItem('lastMessage')
          localStorage.removeItem('lastTx')
        }
      } catch (e) {}
      window.location.href = '/'
    }
  }
}
</script>

<style lang="scss">
.main-layout {
  max-height: 100vh;

  .ant-layout-content {
    overflow-y: auto;
  }
}
@media screen and (max-width: 992px) {
  .ant-layout-sider {
    position: absolute !important;
    z-index: 10;
    height: 100%;
  }

  .navigation-tags {
    margin-left: 23px;
  }
}

.navigation-tags {
  margin-bottom: 5px;
}

#components-layout-demo-responsive {
  min-height: 100vh;

  .header-toolbar {
    .ant-avatar {
      // position: absolute;
      // right: 16px;
      // top: 12px;
      // cursor: pointer;
    }
  }
}

#components-layout-demo-responsive .header-logo {
  height: 30px;
  margin: 16px;
}

.header-logo, .header-logo-mobile {
  img {
    width: 30px;
  }

  font-size: 20px;
  font-weight: bold;
}

.header-logo {
  color: white;
}

.header-logo-mobile {
  margin-left: 20px;
}

@media screen and (min-width: 992px) {
  .header-logo-mobile {
    display: none;
  }
}

.username-container {
  position: absolute;
  right: 18px;
  cursor: pointer;
}

.ant-dropdown {
  min-width: unset;
  left: calc(100% - 150px);
}

</style>