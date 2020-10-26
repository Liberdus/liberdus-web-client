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
    <history />
  </div>
</template>

<script>
import Vue from 'vue'
import History from '~/components/History'
import utils from '../../assets/utils'
import { mapGetters, mapActions } from 'vuex'
import Vuelidate from 'vuelidate'
import { required, minLength, between } from 'vuelidate/lib/validators'
import Notifications from 'vue-notification'

Vue.use(Notifications)

export default {
  components: {
    History,
  },
  layout: 'dashboard',
  data () {
    return {
    }
  },
  beforeDestroy: function () {},
  methods: {
    md () {
      return this.$ons.platform.isAndroid()
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
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      getNetwork: 'chat/getNetwork',
      getTimers: 'chat/getTimers',
      isUIReady: 'chat/isUIReady',
    }),
    title () {
      return this.tabs[this.activeIndex].label
    }
  },
  async mounted () {
  }
}
</script>
