<template>
  <!-- <v-ons-page> -->
  <div>
    <!-- <button
      class="white-button new-funding-button"
      @click="$router.push('/proposal/new/funding')"
    >
      <v-ons-icon icon="ion-ios-wallet" size="lg"></v-ons-icon>New Funding
      Proposal
    </button>

    <button
      class="white-button new-funding-button"
      @click="$router.push('/vote/funding')"
    >
      <v-ons-icon icon="ion-ios-checkmark-circle-outline" size="lg"></v-ons-icon
      >Vote Fundings
    </button>
    <button
      class="white-button new-funding-button"
      @click="$router.push('/vote/success')"
    >
      <v-ons-icon icon="ion-ios-cash" size="lg"></v-ons-icon>Funded Projects
    </button> -->

    <a-row 
      type="flex" 
      justify="space-around" 
      align="middle" 
      class="funding-button-row"
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
            @click="$router.push('/proposal/new/funding')"
          >
            New Funding Proposal
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
            @click="$router.push('/vote/funding')"
          >
            Vote Fundings
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
            icon="fund"
            size="large"
            @click="$router.push('/vote/success')"
          >
            Funded Projects
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
import { concat } from 'lodash'
import utils from '../assets/utils'
import newMessageSoundFile from '../assets/new_message_sound.mp3'
import ToolBar from '~/components/ToolBar'
import FundingItem from '~/components/FundingItem'
import Title from '~/components/baisc/Title'
import Button from '~/components/baisc/Button'
import ProposalListItem from '~/components/ProposalListItem'

export default {
  components: {
    MessageListItem,
    Title,
    ToolBar,
    Button,
    FundingItem,
    ProposalListItem
  },
  data: function () {
    return {}
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
    allCompletedProposalList () {
      const combinedDevProposals = concat(
        this.getActiveDevProposals,
        this.getCompletedDevProposals
      )
      return utils.sortByTimestamp(combinedDevProposals, 'desc')
    }
  }
}
</script>

<style scoped lang="scss">
.funding-button-row {
  margin-top: 30px !important;
}
.my-vote-list-container {
  width: 90%;
  max-width: 600px;
  margin: 20px auto;
}
.new-funding-button {
  width: 250px;
  padding: 0px 20px;
  display: block;
  position: relative;
  margin: 20px auto;
  // font-size: 13px;
}
</style>
