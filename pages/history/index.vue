<template>
  <div>
    <notifications
      group="new-message"
      position="bottom left"
      width="100%"
      classes="my-notification-style"
    />

    <portal to="navigation-tags">
      <a-breadcrumb>
        <a-breadcrumb-item>
          History
        </a-breadcrumb-item>
      </a-breadcrumb>
    </portal>
    <p style="display: none">
      {{ isUIReady }}
    </p>
    <home />
  </div>
</template>

<script>
import Vue from 'vue'
import utils from '../../assets/utils'
import { mapGetters, mapActions } from 'vuex'
import Vuelidate from 'vuelidate'
import { required, minLength, between } from 'vuelidate/lib/validators'
import Notifications from 'vue-notification'

Vue.use(Notifications)
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c))

export default {
  components: {
    Message,
    Home,
    Setting,
    ProposalList,
    FundingList,
    ToolBar
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (!from || !from.name) return
      vm.prevRoute = from
      if (to && to.query.tabIndex) {
        vm.activeIndex = parseInt(to.query.tabIndex)
      } else if (from.path.split('/')[1] === 'vote') {
        if (
          from.path.split('/')[2] === 'funding' ||
          from.path.split('/')[2] === 'success'
        ) {
          vm.activeIndex = 2
        } else if (from.path.split('/')[2] === 'economy') {
          vm.activeIndex = 3
        }
      } else if (from.name.split('-')[0] === 'proposal') {
        if (from.name.split('-')[2] === 'funding') {
          vm.activeIndex = 2
        } else {
          vm.activeIndex = 3
        }
      } else if (from.name.split('-')[0] === 'message') {
        vm.activeIndex = 1
      } else if (from.name.split('-')[0] === 'wallet') {
        vm.activeIndex = 0
      }
    })
  },
  layout: 'dashboard',
  data () {
    return {
      activeIndex: 0,
      onlineSlot: 'online',
      offlineSlot: 'offline',
      nodeHealthChecker: null,
      nodeRotator: null,
      prevRoute: null,
      tabs: [
        {
          icon: 'ion-ios-wallet',
          label: 'Wallet',
          page: Home,
          badge: '',
          key: 'home'
        },
        {
          icon: this.md() ? null : 'ion-ios-chatboxes',
          label: 'Message',
          page: Message,
          badge: '',
          key: 'message'
        },
        {
          icon: this.md() ? null : 'ion-ios-filing',
          label: 'Funding',
          page: FundingList,
          badge: '',
          key: 'funding'
        },
        {
          icon: this.md() ? null : 'ion-ios-people',
          label: 'Economy',
          page: ProposalList,
          badge: '',
          key: 'economy'
        }
      ]
    }
  },
  beforeDestroy: function () {},
  methods: {
    ...mapActions({
      updateAppState: 'chat/updateAppState',
      updateLastMessage: 'chat/updateLastMessage',
      updateLastTx: 'chat/updateLastTx',
      setUIReady: 'chat/setUIReady',
      updateWindowFocus: 'chat/updateWindowFocus',
      addWallet: 'wallet/addWallet',
      updateActiveProposals: 'proposal/updateActiveProposals',
      updateCompletedProposals: 'proposal/updateCompletedProposals',
      updateActiveDevProposals: 'proposal/updateActiveDevProposals',
      updateNetwork: 'chat/updateNetwork',
      addTimer: 'chat/addTimer'
    }),
    md () {
      return this.$ons.platform.isAndroid()
    },
    onSelectTab (e, tab) {
      utils.updateBadge(tab.key, 'reset')
    },
    handleConnectivityChange (status) {
      // console.log(`Connectivity Status: ${status}`)
      // this.updateConnection(status)
      // if (status === true) {
      //   this.$ons.notification.toast('No internet connection', {
      //     timeout: 1000,
      //     animation: 'fall'
      //   })
      // }
    },
    async rotateNode () {
      let self = this
      if (this.$route.path === '/loading' || this.$route.path === '/welcome') {
        return
      }
      try {
        let randomHost = await utils.getRandomHost()
        if (randomHost) {
          let now = Date.now()
          console.log(`Rotate to a random Host on ${new Date()}`)
          console.log(randomHost)
          self.updateNetwork(randomHost)
          utils.updateHost(`${randomHost.ip}:${randomHost.port}`)
        }
      } catch (e) {
        console.warn(e)
      }
    },
    async checkNodeHealth () {
      let self = this
      if (
        this.$route.path === '/loading' ||
        this.$route.path === '/welcome' ||
        this.$route.path === '/setting/network'
      ) {
        return
      }
      if (!this.getWindowFocus) return
      try {
        let shouldUpdate = false
        let isServerActive
        try {
          isServerActive = await utils.isServerActive()
        } catch (e) {
          console.error('Server is offline')
        }

        if (!isServerActive) {
          shouldUpdate = true
        }
        if (shouldUpdate) {
          let randomHost = await utils.getRandomHost()
          if (randomHost) {
            let now = Date.now()
            console.log(`Change to a random Host: `, randomHost)

            self.updateNetwork(randomHost)
            utils.updateHost(`${randomHost.ip}:${randomHost.port}`)
          }
        }
      } catch (e) {
        console.warn(e)
      }
    }
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      getLastMessage: 'chat/getLastMessage',
      getNetwork: 'chat/getNetwork',
      getTimers: 'chat/getTimers',
      isUIReady: 'chat/isUIReady',
      getWindowFocus: 'chat/getWindowFocus',
      getActiveProposals: 'proposal/getActiveProposals',
      getCompletedProposals: 'proposal/getCompletedProposals',
      getActiveDevProposals: 'proposal/getActiveDevProposals',
      getCompletedDevProposals: 'proposal/getCompletedDevProposals'
    }),
    title () {
      return this.tabs[this.activeIndex].label
    }
  },
  async mounted () {
    let self = this
    if (!this.isUIReady) {
      this.$router.push('/loading')
    }
    window.addEventListener('focus', () => {
      self.updateWindowFocus(true)
      console.log(`Is window focused: ${self.getWindowFocus}`)
    })
    window.addEventListener('blur', () => {
      self.updateWindowFocus(false)
      console.log(`Is window focused: ${self.getWindowFocus}`)
    })

    if (!this.getTimers['nodeHealthChecker']) {
      const nodeHealthChecker = setInterval(this.checkNodeHealth, 10000)
      this.addTimer({ key: 'nodeHealthChecker', value: nodeHealthChecker })
    }
    if (!this.getTimers['nodeRotator']) {
      const nodeRotator = setInterval(this.rotateNode, 1000 * 60 * 2)
      this.addTimer({
        key: 'nodeRotator',
        value: nodeRotator
      })
    }
  }
}
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
  font-size: 16px;
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
  margin-top: 20px;
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
