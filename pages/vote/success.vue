<template>
  <!-- <v-ons-page> -->
  <div>
    <portal to="navigation-tags">
      <a-breadcrumb>
        <a-breadcrumb-item>
          <nuxt-link to="/funding">Funding</nuxt-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>Funded Projects</a-breadcrumb-item>
      </a-breadcrumb>
    </portal>

    <div v-if="!loading && (!window || !window.votingWindow)" class="loading-status">
      Unable to get voting window from server
    </div>
    <div v-else class="proposal-list-container">
      <!-- {{ allProposalList }} -->
      <Title text="Funded Projects" />
      <div v-if="activeProposalList.length > 0">
        <ProposalListItem v-for="proposal in activeProposalList" :key="proposal.id" :proposal="proposal" @vote-enter="onVoteReceiveFromChild" />
      </div>
      <div v-else class="no-proposal-message">
        No projects are funded yet.
      </div>
    </div>
    <!-- </v-ons-page> -->
  </div>
</template>

<script>
import MessageListItem from '~/components/MessageListItem';
import { mapGetters, mapActions } from 'vuex';
import utils from '../../assets/utils';
import ToolBar from '~/components/ToolBar';
import ProposalListItem from '~/components/ProposalListItem';
import Title from '~/components/basic/Title';
import Button from '~/components/basic/Button';
import WindowInfo from '~/components/WindowInfo';
import { concat } from 'lodash';
export default {
  components: {
    MessageListItem,
    Title,
    ToolBar,
    Button,
    ProposalListItem,
    WindowInfo,
  },
  layout: 'dashboard',
  data: function() {
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
      loading: true,
    };
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
      getCompletedDevProposals: 'proposal/getCompletedDevProposals',
    }),
    secondsToDhms() {
      let seconds = this.remainingSecondToVotingWindow;
      seconds = Number(seconds);
      let d = Math.floor(seconds / (3600 * 24));
      let h = Math.floor((seconds % (3600 * 24)) / 3600);
      let m = Math.floor((seconds % 3600) / 60);
      let s = Math.floor(seconds % 60);

      let dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : '';
      let hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
      let mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
      let sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
      return dDisplay + hDisplay + mDisplay + sDisplay;
    },
    voteType() {
      return this.$route.params.type;
    },
    currentWindowName() {
      if (!this.window) return;
      const now = Date.now();
      if (now >= this.window.proposalWindow[0] && now < this.window.proposalWindow[1]) {
        return 'PROPOSAL';
      } else if (now >= this.window.votingWindow[0] && now < this.window.votingWindow[1]) {
        return 'VOTING';
      } else if (now >= this.window.graceWindow[0] && now < this.window.graceWindow[1]) {
        return 'GRACE';
      } else if (now >= this.window.applyWindow[0] && now < this.window.applyWindow[1]) {
        return 'APPLY';
      }
      return 'IDLE';
    },
    shouldRender() {
      let should = this.isUIReady;
      return should;
    },
    allProposalList() {
      const combinedProposals = concat(this.getActiveProposals, this.getCompletedProposals);
      return utils.sortByTimestamp(combinedProposals, 'desc');
    },
    activeProposalList() {
      return utils.sortByTimestamp(this.getCompletedDevProposals.filter((p) => p.approved === true));
    },
  },
  methods: {
    ...mapActions({
      updateAppState: 'chat/updateAppState',
      updateLastMessage: 'chat/updateLastMessage',
      updateLastTx: 'chat/updateLastTx',
      updateActiveProposals: 'proposal/updateActiveProposals',
      updateCompletedProposals: 'proposal/updateCompletedProposals',
      updateActiveDevProposals: 'proposal/updateActiveDevProposals',
      updateCompletedDevProposals: 'proposal/updateCompletedDevProposals',
    }),
    onVoteReceiveFromChild(voteInfo) {
      this.voteCollector[voteInfo.number] = voteInfo;
      this.calculateTotal(this.voteCollector);
    },
    calculateTotal(collector) {
      console.log('calculating...');
      let total = Object.values(collector).reduce((prev, current) => prev + current.amount, 0);
      this.totalVoteAmount = total || 0;
    },
    redirect(url) {
      this.$router.push(url);
    },
    async refreshProposalList() {
      let allProposals = await utils.queryProposals();
      let networkParameters = await utils.queryParameters();
      this.networkParameters = networkParameters;
      allProposals = allProposals
        // .filter(proposal => proposal.winner === false)
        .map((proposal) => {
          let proposedParameters = utils.getDifferentParameter(proposal.parameters, networkParameters['current']);
          let obj = { ...proposal };
          obj.proposedParameters = proposedParameters;
          obj.type = 'proposal';
          return obj;
        })
        .filter((proposal) => {
          if (proposal.proposedParameters && Object.keys(proposal.proposedParameters).length > 0) return true;
          else return false;
        });

      let activeProposalList = allProposals.filter((proposal) => {
        return !proposal.hasOwnProperty('winner');
      });
      let completedProposalList = allProposals.filter((proposal) => proposal.winner === true || proposal.winner === false);

      this.updateActiveProposals(activeProposalList);
      this.updateCompletedProposals(completedProposalList);
    },
    async refreshDevProposalList() {
      let allProposals = await utils.queryLatestDevProposals();
      if (!allProposals || allProposals.length === 0) return;
      allProposals = allProposals.map((proposal) => {
        let obj = { ...proposal };
        obj.type = 'dev_proposal';
        return obj;
      });

      let activeDevProposalList = allProposals.filter((proposal) => proposal.approved !== true && proposal.approved !== false);
      let completedDevProposalList = allProposals.filter((proposal) => proposal.approved === true || proposal.approved === false);
      this.updateActiveDevProposals(activeDevProposalList);
      this.updateCompletedDevProposals(completedDevProposalList);
    },
    subscribeProposalList() {
      let self = this;
      // this.propsalListSubscription = setInterval(() => {
      //   if (self.isUIReady) {
      //     console.log('Refreshing proposal and dev proposal list')
      //     self.refreshProposalList()
      //     self.refreshDevProposalList()
      //   }
      // }, 10000)
    },
    unsubscribeProposalList() {
      let self = this;
      clearInterval(this.propsalListSubscription);
      this.propsalListSubscription = null;
    },
    async onSubmitVotes() {
      let myWallet = this.getWallet;
      for (let id in this.voteCollector) {
        if (this.voteCollector[id].amount > 0) {
          let voteTx;
          if (this.voteType === 'economy') {
            voteTx = await utils.createVote(myWallet, id, this.voteCollector[id].amount);
          } else if (this.voteType === 'funding') {
            voteTx = await utils.createDevVote(myWallet, id, this.voteCollector[id].amount, this.voteCollector[id].approve);
          }
          let res = await utils.submitVote(voteTx);
          console.log(res);
        }
      }
      //   this.$router.push(`/proposal/success/economy`)
      this.$ons.notification.alert('Your votes are submitted.');
    },
    async isVotingWindowOpen() {
      try {
        let newNetworkParameters = await utils.queryParameters();
        if (!this.networkParameters) {
          this.networkParameters = newNetworkParameters;
        }

        if (!this.previousWindow) {
          this.window = newNetworkParameters['windows'];
          this.previousWindow = newNetworkParameters['windows'];
        } else if (newNetworkParameters['windows'].proposalWindow[0] > Date.now()) {
          this.window = { ...this.previousWindow };
        } else {
          this.window = newNetworkParameters['windows'];
          this.previousWindow = newNetworkParameters['windows'];
        }

        const votingWindow = this.window.votingWindow;
        if (this.window.votingWindow && this.window.votingWindow[0] >= Date.now()) {
          this.nextVotingStart = this.window.votingWindow[0];
        } else {
          this.nextVotingStart = votingWindow[1] + 1000 * 60 * 4;
        }

        let now = Date.now();
        if (votingWindow[0] > now) this.nextVotingStart = votingWindow[0];
        if (now > votingWindow[0] && now < votingWindow[1]) {
          return true;
        }
        return false;
      } catch (e) {
        console.warn(e);
        this.loading = false;
        return false;
      }
    },
    getRemainingSecondToVoting() {
      if (this.window && this.window.votingWindow) {
        let now = Date.now();
        if (!this.allowVote) {
          if (now < this.window.votingWindow[0]) {
            this.remainingSecondToVotingWindow = Math.round((this.window.votingWindow[0] - now) / 1000);
          } else if (now > this.window.votingWindow[0] && this.nextVotingStart && now < this.nextVotingStart) {
            this.remainingSecondToVotingWindow = Math.round((this.nextVotingStart - now) / 1000);
          }
        } else if (this.allowVote) {
          if (this.window.votingWindow[1] >= now) {
            this.remainingSecondToVotingWindow = Math.round((this.window.votingWindow[1] - now) / 1000);
          }
        }
      }
    },
  },
  mounted: function() {
    this.refreshProposalList();
    this.refreshDevProposalList();
    this.subscribeProposalList();

    this.votingWindowChecker = setInterval(async () => {
      this.allowVote = await this.isVotingWindowOpen();
    }, 1000);

    this.votingWindowTimer = setInterval(this.getRemainingSecondToVoting, 1000);
  },
  beforeDestroy: function() {
    this.unsubscribeProposalList();
    console.log('Clearing proposal window checker...');
    clearInterval(this.proposalWindowChecker);
    clearInterval(this.proposalWindowTimer);
  },
};
</script>

<style scoped lang="scss">
.proposal-list-container {
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
  margin-bottom: 100px;
}
</style>
