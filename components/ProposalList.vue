<template>
  <!-- <v-ons-page> -->
  <div>
    <!-- <button
      class="white-button new-proposal-button"
      @click="$router.push('/proposal/new/economy')"
    >
      <v-ons-icon icon="ion-ios-paper" size="lg"></v-ons-icon>New Change
      Proposal
    </button>
    <button
      class="white-button new-proposal-button"
      @click="$router.push('/vote/economy')"
    >
      <v-ons-icon icon="ion-ios-checkmark-circle-outline" size="lg"></v-ons-icon
      >Vote Proposals
    </button> -->

    <a-row 
      type="flex" 
      justify="space-around" 
      align="middle" 
      class="funding-button-row"
      style="margin-top:30px;"
      :gutter="[0,16]"
    >
      <a-col span="24">
        <a-row 
          type="flex" 
          justify="space-around" 
          align="middle"
        >
          <a-button
            type="primary"
            shape="round"
            icon="plus-square"
            size="large"
            @click="$router.push('/economy/new/economy')"
          >
            New Economy Proposal
          </a-button>
        </a-row>
      </a-col>

      <a-col span="24">
        <a-row 
          type="flex" 
          justify="space-around" 
          align="middle"
        >
          <a-button
            type="primary"
            shape="round"
            icon="check-square"
            size="large"
            @click="$router.push('/vote/economy')"
          >
            Vote Proposals
          </a-button>
        </a-row>
      </a-col>
    </a-row>
  <!-- </v-ons-page> -->
  </div>
</template>

<script>
import MessageListItem from '~/components/MessageListItem'
import { mapGetters, mapActions } from 'vuex'
import utils from '../assets/utils'
import newMessageSoundFile from '../assets/new_message_sound.mp3'
import ToolBar from '~/components/ToolBar'
import ProposalListItem from '~/components/ProposalListItem'
import Title from '~/components/baisc/Title'
import Button from '~/components/baisc/Button'
import { concat } from 'lodash'
export default {
  components: {
    MessageListItem,
    Title,
    ToolBar,
    Button,
    ProposalListItem
  },
  data: function () {
    return {
      proposalList: [],
      propsalListSubscription: null
    }
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      getLastMessage: 'chat/getLastMessage',
      isUIReady: 'chat/isUIReady',
      getActiveProposals: 'proposal/getActiveProposals',
      getCompletedProposals: 'proposal/getCompletedProposals',
      getActiveDevProposals: 'proposal/getActiveDevProposals',
      getCompletedDevProposals: 'proposal/getCompletedDevProposals'
    }),
    shouldRender () {
      let should = this.isUIReady
      return should
    }
  },
  methods: {
    ...mapActions({
      updateAppState: 'chat/updateAppState',
      updateLastMessage: 'chat/updateLastMessage',
      updateLastTx: 'chat/updateLastTx',
      updateActiveProposals: 'proposal/updateActiveProposals',
      updateCompletedProposals: 'proposal/updateCompletedProposals',
      updateActiveDevProposals: 'proposal/updateActiveDevProposals',
      updateCompletedDevProposals: 'proposal/updateCompletedDevProposals'
    }),
    redirect (url) {
      this.$router.push(url)
    }
  },
  mounted: function () {},
  beforeDestroy: function () {}
}
</script>

<style scoped lang="scss">
.nuxt-link {
  width: 100%;
}
.new-proposal-button {
  width: 250px;
  padding: 0px 20px;
  display: block;
  position: relative;
  margin: 20px auto;
  // font-size: 13px;
}
.proposal-list-container {
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
}
</style>
