<template>
  <v-ons-page>
    <tool-bar
      :option="{
        menu: false,
        notification: false,
        back: true,
        redirectUrl: '/'
      }"
    />
    <div class="proposal-detail-container">
      <h2 class="proposal-title">{{ proposalTitle }}</h2>
      <h4 class="proposal-type" v-if="proposal.type === 'proposal'">
        Parameter Proposal
      </h4>
      <h4 class="proposal-type" v-else-if="proposal.type === 'dev_proposal'">
        Development Proposal
      </h4>
      <div class="proposal-info-detail">
        <div class="row-1">
          <div>
            <p class="label">ID</p>
            <p class="value">{{ shortenAddress(proposal.id) }}</p>
          </div>
          <div>
            <p class="label">Hash</p>
            <p class="value">{{ shortenAddress(proposal.hash) }}</p>
          </div>
        </div>
        <div class="row-2">
          <div>
            <p class="label">Total Votes</p>
            <p class="value">{{ proposal.totalVotes }}</p>
          </div>
          <div>
            <p class="label">Date</p>
            <p class="value">{{ timestamp }}</p>
          </div>
        </div>
        <div class="row-3">
          <div>
            <p class="label">Proposal Status</p>
            <p class="value success" v-if="status === 'Success'">
              {{ status }}
            </p>
            <p class="value fail" v-else-if="status === 'Failed'">
              {{ status }}
            </p>
            <p class="value" v-else>{{ status }}</p>
          </div>
          <div>
            <!-- <p class="label">Date</p>
            <p class="value">{{ timestamp }}</p>-->
          </div>
        </div>

        <div v-if="proposal.type === 'proposal'">
          <p class="proposal-description">Proposed Value</p>
          <p
            class="sub-head"
            v-for="parameter in Object.keys(proposal.proposedParameters)"
            :key="parameter"
          >
            <strong
              >{{ parameter }} -
              {{ proposal.proposedParameters[parameter] }}</strong
            >
          </p>
        </div>

        <div v-if="proposal.type === 'dev_proposal'">
          <div>
            <p class="label">Proposed Total Amount</p>
            <p class="value">{{ proposal.totalAmount }}</p>
          </div>
          <p class="label">Pay Address</p>
          <p class="value">{{ shortenAddress(proposal.payAddress) }}</p>
        </div>
      </div>
    </div>

    <div class="vote-section" v-if="status === 'Active'">
      <div>
        <p class="label">Enter amount of token to vote</p>
        <input
          type="text"
          v-model="tokenToVote"
          class="text-input"
          autocorrect="off"
          autocomplete="off"
          autocapitalize="off"
        />
      </div>

      {{ this.votingWindow }}
      <!-- <p class="coin-usage-warning" v-if="!allowVoting">Voting window will start at </p> -->
      <p class="coin-usage-warning" v-if="!allowVoting">
        Voting window will start at
        <strong v-if="this.votingWindow">{{
          new Date(this.votingWindow[0])
        }}</strong>
      </p>
      <p class="coin-usage-warning" v-else>Voting window is open now.</p>

      <Button text="Vote" :onClick="submitVote" :isDisabled="!allowVoting" />
    </div>
  </v-ons-page>
</template>

<script>
import Vue from 'vue'
import 'onsenui/css/onsenui.css'
import 'onsenui/css/onsen-css-components.css'
import VueOnsen from 'vue-onsenui/esm'
import OnsenComponents from '~/components/Onsen'
import ChatText from '~/components/ChatText'
import ChatInput from '~/components/ChatInput'
import { mapGetters, mapActions } from 'vuex'
import utils from '../../assets/utils'
import sentSoundFile from '../../assets/sent_sound.mp3'
import ToolBar from '~/components/ToolBar'
import ProposalListItem from '~/components/ProposalListItem'
import Choice from '~/components/Choice'
import Title from '~/components/baisc/Title'
import Button from '~/components/baisc/Button'
import moment from 'moment'
Vue.use(VueOnsen)
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c))

export default {
  components: {
    ToolBar,
    Button,
    Title,
    Choice
  },
  validate ({ params }) {
    return true
  },
  data: function () {
    return {
      text: '',
      tokenToVote: 50,
      votingWindowChecker: null,
      allowVoting: false,
      votingWindow: null
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
    id () {
      return this.$route.params.id
    },
    proposalTitle () {
      if (this.proposal.type === 'proposal')
        return this.proposal.id.slice(0, 8).toUpperCase()
      if (this.proposal.type === 'dev_proposal')
        return this.proposal.description
    },
    status () {
      if (this.proposal.type === 'proposal') {
        if (this.proposal.winner === true) return 'Success'
        else if (this.proposal.winner === false) return 'Failed'
        else return 'Active'
      } else if (this.proposal.type === 'dev_proposal') {
        if (this.proposal.approved === true) return 'Success'
        else if (this.proposal.approved === false) return 'Failed'
        else return 'Active'
      }
    },
    timestamp () {
      return moment(this.proposal.timestamp).calendar()
    },
    proposal () {
      let foundProposal
      if (!foundProposal)
        foundProposal = this.getActiveProposals.find(p => p.id === this.id)
      if (!foundProposal)
        foundProposal = this.getActiveDevProposals.find(p => p.id === this.id)
      if (!foundProposal)
        foundProposal = this.getCompletedProposals.find(p => p.id === this.id)
      if (!foundProposal)
        foundProposal = this.getCompletedDevProposals.find(
          p => p.id === this.id
        )
      return foundProposal
    }
  },
  mounted: async function () {
    if (this.proposal && this.status === 'Active')
      this.votingWindowChecker = setInterval(async () => {
        if (this.proposal)
          this.allowVoting = await this.isVotingWindowOpen(this.proposal.type)
      }, 3000)
  },
  methods: {
    shortenAddress (address) {
      return address.slice(0, 6) + '...' + address.slice(58, 64)
    },
    async isVotingWindowOpen (type) {
      let networkParameters = await utils.queryParameters()
      let votingWindow = networkParameters.votingWindow
      let devVotingWindow = networkParameters.devVotingWindow
      let now = Date.now()
      if (type === 'proposal') {
        this.votingWindow = votingWindow
        if (now > votingWindow[0] && now < votingWindow[1]) {
          return true
        }
      } else if (type === 'dev_proposal') {
        this.votingWindow = devVotingWindow
        if (now > devVotingWindow[0] && now < devVotingWindow[1]) {
          return true
        }
      }
      return false
    },
    async submitVote () {
      let myWallet = this.getWallet
      let voteTx = await utils.createVote(
        myWallet,
        this.proposal.number,
        this.tokenToVote
      )
      console.log(voteTx)
      let isSubmitted = await utils.submitVote(voteTx)
      if (isSubmitted) {
        this.tokenToVote = 50
        this.$router.push(`/proposal/success/${this.id}`)
      }
    }
  }
}
</script>

<style>
.proposal-detail-container {
  padding: 20px;
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
}
.proposal-detail-container p {
  text-align: left;
}
.proposal-detail-container .proposal-type {
  font-family: Poppins;
  font-size: 13px;
  color: #0076ff;
  font-weight: 700;
}
.proposal-detail-container .proposal-title {
  font-family: Poppins;
  font-size: 22px;
  color: #0a2463;
  letter-spacing: 0;
}
.proposal-detail-container .proposal-info-detail .row-1,
.proposal-detail-container .proposal-info-detail .row-2,
.proposal-detail-container .proposal-info-detail .row-3,
.proposal-detail-container .proposal-info-detail .row-4 {
  display: flex;
  justify-content: space-between;
}
.proposal-detail-container .proposal-info-detail .label {
  font-family: Poppins;
  font-size: 12px;
  color: #6e6e6e;
  letter-spacing: 0;
  line-height: 20px;
}
.proposal-detail-container .proposal-info-detail .value {
  font-family: Poppins;
  font-size: 14px;
  color: #0a2463;
  letter-spacing: 0;
  line-height: 20px;
}
.proposal-detail-container .proposal-info-detail .value.success {
  color: green;
}
.proposal-detail-container .proposal-info-detail .value.fail {
  color: red;
}
.proposal-detail-container .proposal-description {
  font-family: Poppins;
  font-size: 14px;
  color: #6a6a6a;
  letter-spacing: 0;
  line-height: 20px;
  margin: 10px auto;
}
.proposal-detail-container .sub-head {
  font-family: Poppins;
  font-size: 15px;
  color: #0a2463;
  letter-spacing: 0;
}
.proposal-detail-container .hr {
  margin: 20px auto;
  width: 100%;
  height: 1px;
  background: #d8d8d8;
}
.choice-list-container {
  margin: 20px auto;
}
.vote-section {
  width: 90%;
  max-width: 600px;
  margin: 10px auto;
}
.proposal-info-detail .row-1 div:nth-of-type(2) p {
  text-align: right;
}
.proposal-info-detail .row-2 div:nth-of-type(2) p {
  text-align: right;
}
.proposal-info-detail .row-3 div:nth-of-type(2) p {
  text-align: right;
}
</style>
