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
        <a-breadcrumb-item>Economy</a-breadcrumb-item>
      </a-breadcrumb>
    </portal>

    <p style="display: none">
      {{ isUIReady }}
    </p>

    <proposal-list />
  </div>
</template>

<script>
import Vue from 'vue'
import utils from '../../assets/utils'
import { mapGetters, mapActions } from 'vuex'
import Vuelidate from 'vuelidate'
import { required, minLength, between } from 'vuelidate/lib/validators'
import Notifications from 'vue-notification'
import ProposalList from '~/components/ProposalList'

Vue.use(Vuelidate)
Vue.use(Notifications)

export default {
  components: {
    ProposalList,
  },
  layout: 'dashboard',
  data () {
    return {
      activeIndex: 0,
      onlineSlot: 'online',
      offlineSlot: 'offline',
      nodeHealthChecker: null,
      nodeRotator: null,
      prevRoute: null
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