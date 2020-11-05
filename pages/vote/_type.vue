<template>
  <!-- <v-ons-page> -->
  <div>
    <portal to="navigation-tags">
      <a-breadcrumb v-if="voteType === 'economy'">
        <a-breadcrumb-item>
          <nuxt-link to="/economy">Economy</nuxt-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>Vote Proposals</a-breadcrumb-item>
      </a-breadcrumb>

      <a-breadcrumb v-else-if="voteType === 'funding'">
        <a-breadcrumb-item>
          <nuxt-link to="/funding">Funding</nuxt-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>Vote Fundings</a-breadcrumb-item>
      </a-breadcrumb>

      <a-breadcrumb v-else-if="voteType === 'funding_success'">
        <a-breadcrumb-item>
          <nuxt-link to="/funding">Funding</nuxt-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>Funded Projects</a-breadcrumb-item>
      </a-breadcrumb>
    </portal>

    <div
      v-if="!loading && (!window || !window.votingWindow)"
      class="loading-status"
    >
      Unable to get voting window from server
    </div>
    <div
      v-else
      class="proposal-list-container"
    >
      <Title
        v-if="voteType === 'economy'"
        text="Vote Proposals"
      />
      <Title
        v-else-if="voteType === 'funding'"
        text="Vote Fundings"
      />
      <Title
        v-else-if="voteType === 'funding_success'"
        text="Funded Projects"
      />

      <window-info
        v-if="window"
        :window="window"
        :current-window-name="currentWindowName"
      />
      <div
        v-if="activeProposalList.length > 0"
        class="list-container"
      >
        <ProposalListItem
          v-for="proposal in activeProposalList"
          :key="proposal.id"
          :ref="proposal.id.slice(0, 6)"
          :proposal="proposal"
          :current-window-name="currentWindowName"
          @vote-enter="onVoteReceiveFromChild"
        />
      </div>
      <div
        v-else
        class="no-proposal-message"
      >
        No
        <strong>active</strong>
        {{ voteType }} proposals to vote
      </div>
    </div>
    <div class="vote-footer">
      <p
        v-if="
          allowVote &&
            networkParameters &&
            networkParameters.current.transactionFee
        "
      >
        Submitting votes will cost vote amount total:
        <strong>{{ totalVoteAmount }}</strong> coins + Transaction Fee:
        <strong>{{ networkParameters.current.transactionFee }}</strong>
        coins
      </p>
      <p v-if="!allowVote">
        Voting window will start in
        <strong v-if="remainingSecondToVotingWindow">
          {{ secondsToDhms }}
        </strong>
      </p>
      <a-button
        class="default-button new-proposal-button"
        :disabled="!allowVote"
        @click="onSubmitVotes"
      >
        Submit Votes
      </a-button>
    </div>
  <!-- </v-ons-page> -->
  </div>
</template>

<script>
import MessageListItem from '~/components/MessageListItem'
import { mapGetters, mapActions } from 'vuex'
import utils from '../../assets/utils'
import ToolBar from '~/components/ToolBar'
import ProposalListItem from '~/components/ProposalListItem'
import Title from '~/components/baisc/Title'
import Button from '~/components/baisc/Button'
import WindowInfo from '~/components/WindowInfo'
import { concat } from 'lodash'
export default {
  components: {
    MessageListItem,
    Title,
    ToolBar,
    Button,
    ProposalListItem,
    WindowInfo
  },
  layout: 'dashboard',
  data: function () {
    return {
      proposalList: [],
      propsalListSubscription: null,
      voteCollector: {},
      window: null,
      previousWindow: null,
      votingWindowChecker: null,
      votingWindowTimer: null,
      remainingSecondToVotingWindow: null,
      nextVotingStart: null,
      allowVote: false,
      networkParameters: null,
      totalVoteAmount: 0,
      loading: true
    }
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      getLastMessage: 'chat/getLastMessage',
      isUIReady: 'chat/isUIReady',
      getWindowFocus: 'chat/getWindowFocus',
      getActiveProposals: 'proposal/getActiveProposals',
      getCompletedProposals: 'proposal/getCompletedProposals',
      getActiveDevProposals: 'proposal/getActiveDevProposals',
      getCompletedDevProposals: 'proposal/getCompletedDevProposals'
    }),
    secondsToDhms () {
      let seconds = this.remainingSecondToVotingWindow
      seconds = Number(seconds)
      let d = Math.floor(seconds / (3600 * 24))
      let h = Math.floor((seconds % (3600 * 24)) / 3600)
      let m = Math.floor((seconds % 3600) / 60)
      let s = Math.floor(seconds % 60)

      let dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : ''
      let hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : ''
      let mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : ''
      let sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : ''
      return dDisplay + hDisplay + mDisplay + sDisplay
    },
    voteType () {
      return this.$route.params.type
    },
    currentWindowName () {
      if (!this.window) return
      const now = Date.now()

      if (this.voteType === 'economy') {
        if (
          now >= this.window.proposalWindow[0] &&
          now < this.window.proposalWindow[1]
        ) {
          return 'PROPOSAL'
        } else if (
          now >= this.window.votingWindow[0] &&
          now < this.window.votingWindow[1]
        ) {
          return 'VOTING'
        } else if (
          now >= this.window.graceWindow[0] &&
          now < this.window.graceWindow[1]
        ) {
          return 'GRACE'
        } else if (
          now >= this.window.applyWindow[0] &&
          now < this.window.applyWindow[1]
        ) {
          return 'APPLY'
        }
      } else if (this.voteType === 'funding') {
        if (
          now >= this.window.devProposalWindow[0] &&
          now < this.window.devProposalWindow[1]
        ) {
          return 'PROPOSAL'
        } else if (
          now >= this.window.devVotingWindow[0] &&
          now < this.window.devVotingWindow[1]
        ) {
          return 'VOTING'
        } else if (
          now >= this.window.devGraceWindow[0] &&
          now < this.window.devGraceWindow[1]
        ) {
          return 'GRACE'
        } else if (
          now >= this.window.devApplyWindow[0] &&
          now < this.window.devApplyWindow[1]
        ) {
          return 'APPLY'
        }
      }
      return 'IDLE'
    },
    shouldRender () {
      let should = this.isUIReady
      return should
    },
    allProposalList () {
      const combinedProposals = concat(
        this.getActiveProposals,
        this.getCompletedProposals
      )
      return utils.sortByTimestamp(combinedProposals, 'desc')
    },
    activeProposalList () {
      if (this.voteType === 'economy') {
        if (
          this.currentWindowName === 'GRACE' ||
          this.currentWindowName === 'APPLY'
        ) {
          if (this.getActiveProposals.length > 0) {
            return utils.sortByTimestamp(this.getActiveProposals, 'desc')
          } else {
            let THREE_MINUTE = 1000 * 60 * 3
            let limitTimestamp = Date.now() - THREE_MINUTE
            let completedProposalInCurrentCycle = this.getCompletedProposals.filter(
              p => p.timestamp > limitTimestamp
            )
            return utils.sortByTimestamp(
              completedProposalInCurrentCycle,
              'desc'
            )
          }
        } else {
          return utils.sortByTimestamp(this.getActiveProposals, 'desc')
        }
      } else if (this.voteType === 'funding') {
        if (
          this.currentWindowName === 'GRACE' ||
          this.currentWindowName === 'APPLY'
        ) {
          if (this.getActiveDevProposals.length > 0) {
            return utils.sortByTimestamp(this.getActiveDevProposals, 'desc')
          } else {
            let THREE_MINUTE = 1000 * 60 * 3
            let limitTimestamp = Date.now() - THREE_MINUTE
            let completedProposalInCurrentCycle = this.getCompletedDevProposals.filter(
              p => p.timestamp > limitTimestamp
            )
            return utils.sortByTimestamp(
              completedProposalInCurrentCycle,
              'desc'
            )
          }
        } else {
          return utils.sortByTimestamp(this.getActiveDevProposals, 'desc')
        }
      } else if (this.voteType === 'all') {
        return this.allProposalList
      } else return []
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
    onVoteReceiveFromChild (voteInfo) {
      this.voteCollector[voteInfo.number] = voteInfo
      this.calculateTotal(this.voteCollector)
    },
    calculateTotal (collector) {
      let total = Object.values(collector).reduce(
        (prev, current) => prev + current.amount,
        0
      )
      this.totalVoteAmount = total || 0
    },
    redirect (url) {
      this.$router.push(url)
    },
    async refreshProposalList () {
      let allProposals = await utils.queryLatestProposals()
      console.log('Economy Proposals', allProposals)
      let networkParameters = await utils.queryParameters(
        `/vote/_type, refreshProposalList`
      )
      this.networkParameters = networkParameters
      allProposals = allProposals.map(proposal => {
        let proposedParameters = utils.getDifferentParameter(
          proposal.parameters,
          networkParameters['current']
        )
        let obj = { ...proposal }
        obj.proposedParameters = proposedParameters
        obj.type = 'proposal'
        return obj
      })
      // .filter(proposal => {
      //   if (
      //     proposal.proposedParameters &&
      //     Object.keys(proposal.proposedParameters).length > 0
      //   )
      //     return true
      //   else return false
      // })

      let activeProposalList = allProposals.filter(
        proposal => proposal.winner === true || proposal.winner === false
      )
      let completedProposalList = allProposals.filter(
        proposal => proposal.winner === true || proposal.winner === false
      )
      this.updateActiveProposals(activeProposalList)
      this.updateCompletedProposals(completedProposalList)
    },
    async refreshDevProposalList () {
      console.log('Refreshing dev proposal list...')
      let allProposals = await utils.queryLatestDevProposals()
      if (!allProposals || allProposals.length === 0) return
      allProposals = allProposals.map(proposal => {
        let obj = { ...proposal }
        obj.type = 'dev_proposal'
        return obj
      })
      
      let activeDevProposalList = allProposals.filter(
        proposal => proposal.approved !== true && proposal.approved !== false
      )
      let completedDevProposalList = allProposals.filter(
        proposal => proposal.approved === true || proposal.approved === false
      )
      this.updateActiveDevProposals(activeDevProposalList)
      this.updateCompletedDevProposals(completedDevProposalList)
    },
    subscribeProposalList () {
      let self = this
      this.propsalListSubscription = setInterval(() => {
        if (self.isUIReady) {
          self.refreshProposalList()
          self.refreshDevProposalList()
        }
      }, 10000)
    },
    unsubscribeProposalList () {
      let self = this
      clearInterval(this.propsalListSubscription)
      clearInterval(this.votingWindowChecker)
      this.propsalListSubscription = null
      this.votingWindowChecker = null
      return true
    },
    async onSubmitVotes () {
      let myWallet = this.getWallet
      for (let id in this.voteCollector) {
        if (this.voteCollector[id].amount > 0) {
          let voteTx
          if (this.voteType === 'economy') {
            voteTx = await utils.createVote(
              myWallet,
              id,
              this.voteCollector[id].approve,
              this.voteCollector[id].amount
            )
          } else if (this.voteType === 'funding') {
            voteTx = await utils.createDevVote(
              myWallet,
              id,
              this.voteCollector[id].amount,
              this.voteCollector[id].approve
            )
          }
          let res = await utils.submitVote(voteTx)
          console.log(res)
        }
      }
      let self = this
      let refList = this.$refs
      this.activeProposalList.forEach(function (p) {
        refList[p.id.slice(0, 6)][0].clearVote()
      })
      this.$ons.notification.alert('Your votes are submitted.')
    },
    async isVotingWindowOpen () {
      if (!this.getWindowFocus) return
      try {
        let newNetworkParameters = await utils.queryParameters(
          `/vote/_type, isVotingWindowsOpen`
        )
        if (!this.networkParameters) {
          this.networkParameters = newNetworkParameters
        }
        const WINDOW_TYPE =
          this.voteType === 'economy' ? 'windows' : 'devWindows'
        if (!this.previousWindow) {
          this.window = newNetworkParameters[WINDOW_TYPE]
          this.devWindow = newNetworkParameters['devWindows']
          this.previousWindow = newNetworkParameters[WINDOW_TYPE]
        } else if (
          this.voteType === 'economy' &&
          newNetworkParameters[WINDOW_TYPE].proposalWindow[0] > Date.now()
        ) {
          this.window = { ...this.previousWindow }
        } else if (
          this.voteType === 'funding' &&
          newNetworkParameters[WINDOW_TYPE].devProposalWindow[0] > Date.now()
        ) {
          this.window = { ...this.previousWindow }
        } else {
          this.window = newNetworkParameters[WINDOW_TYPE]
          this.previousWindow = newNetworkParameters[WINDOW_TYPE]
        }
        const VOTING_WINDOW =
          this.voteType === 'economy'
            ? this.window.votingWindow
            : this.window.devVotingWindow
        if (VOTING_WINDOW && VOTING_WINDOW[0] >= Date.now()) {
          this.nextVotingStart = VOTING_WINDOW[0]
        } else {
          const wholeCycleDuration = utils.calculateWholeCycleDuration(
            this.window,
            this.devWindow
          )
          this.nextVotingStart = VOTING_WINDOW[0] + wholeCycleDuration
        }
        let now = Date.now()
        if (VOTING_WINDOW[0] > now) this.nextVotingStart = VOTING_WINDOW[0]
        if (now > VOTING_WINDOW[0] && now < VOTING_WINDOW[1]) {
          return true
        }
        return false
      } catch (e) {
        console.warn(e)
        this.loading = false
        return false
      }
    },
    getRemainingSecondToVoting () {
      if (!this.getWindowFocus) return
      try {
        if (
          this.window &&
          (this.window.votingWindow || this.window.devVotingWindow)
        ) {
          const VOTING_WINDOW =
            this.voteType === 'economy'
              ? this.window.votingWindow
              : this.window.devVotingWindow
          let now = Date.now()
          if (!this.allowVote) {
            if (now < VOTING_WINDOW[0]) {
              this.remainingSecondToVotingWindow = Math.round(
                (VOTING_WINDOW[0] - now) / 1000
              )
            } else if (
              now > VOTING_WINDOW[0] &&
              this.nextVotingStart &&
              now < this.nextVotingStart
            ) {
              this.remainingSecondToVotingWindow = Math.round(
                (this.nextVotingStart - now) / 1000
              )
            }
          } else if (this.allowVote) {
            if (VOTING_WINDOW[1] >= now) {
              this.remainingSecondToVotingWindow = Math.round(
                (VOTING_WINDOW[1] - now) / 1000
              )
            }
          }
        }
      } catch (e) {
        console.warn('Unable to get remaining seconds to voting')
      }
    }
  },
  mounted: async function () {
    this.refreshProposalList()
    this.refreshDevProposalList()
    await this.subscribeProposalList()
    this.allowVote = await this.isVotingWindowOpen()
    this.getRemainingSecondToVoting()

    this.votingWindowChecker = setInterval(async () => {
      this.allowVote = await this.isVotingWindowOpen()
    }, 10000)

    this.votingWindowTimer = setInterval(this.getRemainingSecondToVoting, 10000)
  },
  beforeDestroy: async function () {
    await this.unsubscribeProposalList()
    console.log('Clearing timers from voting page...')
    try {
      clearInterval(this.votingWindowChecker)
      clearInterval(this.votingWindowTimer)
      clearInterval(this.propsalListSubscription)
      clearInterval(this.votingWindowChecker)
    } catch (e) {
      console.warn(e)
    }
  }
}
</script>

<style lang="scss">
.nuxt-link {
  width: 100%;
}
.new-proposal-button {
  width: auto;
  padding: 0px 20px;
  display: block;
  position: relative;
  margin: 20px auto;
  // font-size: 13px;
}
.loading-status {
  text-align: center;
  margin: 20px auto;
  position: relative;
  top: 100px;
}
.proposal-list-container {
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
  margin-bottom: 130px;
}
.no-proposal-message {
  margin: 30px auto;
  text-align: center;
}
.vote-footer {
  position: fixed;
  bottom: 0px;
  left: 200px;
  width: calc(100% - 200px);
  box-shadow: 0 -2px 0px 0px rgb(205, 205, 205);
  p {
    width: 90%;
    max-width: 600px;
    margin: 10px auto;
    background-color: white;
  }
  .default-button {
    width: 90%;
    max-width: 600px;
    height: 50px;
    cursor: pointer;
    margin: 5px auto;
    margin-bottom: 10px;
    :disabled {
      background: #d1d1d1;
      cursor: not-allowed;
    }
  }
  .default-button:disabled {
    background: #d1d1d1;
    cursor: not-allowed;
  }
}

@media only screen and (max-width: 992px) {
  .vote-footer {
    left: 0px;
    width: 100%;
  }
}
</style>
