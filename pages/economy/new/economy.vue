<template>
  <!-- <v-ons-page> -->
  <div>
    <portal to="navigation-tags">
      <a-breadcrumb>
        <a-breadcrumb-item>
          <nuxt-link to="/economy">Economy</nuxt-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>New Economy Proposal</a-breadcrumb-item>
      </a-breadcrumb>
    </portal>

    <form class="proposal-create-container" @submit="onSubmitProposal">
      <h2 class="title-2">
        Network Economy Proposal
      </h2>
      <div v-if="loading" class="loading-status">
        <v-ons-progress-circular indeterminate />
      </div>
      <div
        v-else-if="!loading && (!window || !window.proposalWindow)"
        class="loading-status"
      >
        Unable to get proposal window from server
      </div>
      <div v-else>
        <p class="body">
          Submit new proposal when proposal window is active.
        </p>
        <window-info
          v-if="window"
          :window="window"
          :current-window-name="currentWindowName"
        />

        <table id="network-table">
          <thead>
            <tr>
              <td>Parameter</td>
              <td>Current</td>
              <td>New</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="parameter-name">
                Funding Proposal Fee
              </td>
              <td class="current-value">
                {{ networkParameters.current.devProposalFee }}
              </td>
              <td class="new-value">
                <input v-model="form.devProposalFee" required />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">
                Network Proposal Fee
              </td>
              <td class="current-value">
                {{ networkParameters.current.proposalFee }}
              </td>
              <td class="new-value">
                <input v-model="form.proposalFee" required />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">
                Min. Maintenance Fee
              </td>
              <td class="current-value">
                {{ networkParameters.current.maintenanceFee }}
              </td>
              <td class="new-value">
                <input v-model="form.maintenanceFee" required />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">
                Maintenance Interval
              </td>
              <td class="current-value">
                {{ networkParameters.current.maintenanceInterval }}
              </td>
              <td class="new-value">
                <input v-model="form.maintenanceInterval" required />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">
                Node Penalty
              </td>
              <td class="current-value">
                {{ networkParameters.current.nodePenalty }}
              </td>
              <td class="new-value">
                <input v-model="form.nodePenalty" required />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">
                Node Reward Amount
              </td>
              <td class="current-value">
                {{ networkParameters.current.nodeRewardAmount }}
              </td>
              <td class="new-value">
                <input v-model="form.nodeRewardAmount" required />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">
                Node Reward Interval
              </td>
              <td class="current-value">
                {{ networkParameters.current.nodeRewardInterval }}
              </td>
              <td class="new-value">
                <input v-model="form.nodeRewardInterval" required />
              </td>
            </tr>

            <tr>
              <td class="parameter-name">
                Stake Required
              </td>
              <td class="current-value">
                {{ networkParameters.current.stakeRequired }}
              </td>
              <td class="new-value">
                <input v-model="form.stakeRequired" required />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">
                Transaction Fee
              </td>
              <td class="current-value">
                {{ networkParameters.current.transactionFee }}
              </td>
              <td class="new-value">
                <input v-model="form.transactionFee" required />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">
                Faucet Amount
              </td>
              <td class="current-value">
                {{ networkParameters.current.faucetAmount }}
              </td>
              <td class="new-value">
                <input v-model="form.faucetAmount" required />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">
                Default Toll
              </td>
              <td class="current-value">
                {{ networkParameters.current.defaultToll }}
              </td>
              <td class="new-value">
                <input v-model="form.defaultToll" required />
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          <p class="label">
            Title
          </p>
          <a-input
            v-model="form.title"
            name="title-input"
            size="large"
            placeholder="Input title"
          />
        </div>
        <div>
          <p class="label">
            Description
          </p>
          <a-textarea
            v-model="form.description"
            name="description-input"
            cols="30"
            rows="5"
            placeholder="Input description"
          />
        </div>

        <p v-if="!allowProposal" class="coin-usage-warning">
          Proposal window will start in
          <strong v-if="nextProposalStart">{{ secondsToDhms }}</strong>
        </p>
        <p v-else class="coin-usage-warning">
          Proposal window will expire in
          <strong>{{ secondsToDhms }}</strong
          >.
          <span v-if="allowProposal && !issueGenerated">
            Waiting network to create default proposal...
          </span>
        </p>

        <a-button
          type="primary"
          htmlType="submit"
          @click="onSubmitProposal"
          :disabled="!allowProposal || !issueGenerated"
          style="width:100%"
          size="large"
        >
          <span v-if="allowProposal && !issueGenerated">Waiting New Issue</span>
          <span v-else>Submit Proposal</span>
        </a-button>
        <p
          v-if="
            networkParameters.current.proposalFee &&
              networkParameters.current.transactionFee
          "
        >
          Submitting proposal will cost Proposal Fee:
          <strong>{{ networkParameters.current.proposalFee }}</strong> coins +
          Transaction Fee:
          <strong>{{ networkParameters.current.transactionFee }}</strong> coins
        </p>
      </div>
    </form>
    <!-- </v-ons-page> -->
  </div>
</template>

<script>
import Vue from 'vue';
import moment from 'moment';
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import VueOnsen from 'vue-onsenui/esm';
import OnsenComponents from '~/components/Onsen';
import ChatText from '~/components/ChatText';
import ChatInput from '~/components/ChatInput';
import { mapGetters, mapActions } from 'vuex';
import utils from '../../../assets/utils';
import ToolBar from '~/components/ToolBar';
import ProposalListItem from '~/components/ProposalListItem';
import WindowInfo from '~/components/WindowInfo';
import Choice from '~/components/Choice';
import Title from '~/components/baisc/Title';
import Button from '~/components/baisc/Button';

Vue.use(VueOnsen);
Object.values(OnsenComponents).forEach((c) => Vue.component(c.name, c));

export default {
  components: {
    ToolBar,
    WindowInfo,
    Button,
    Title,
    Choice,
  },
  layout: 'dashboard',
  data: function() {
    return {
      networkParameters: null,
      selectedParameter: 'transactionFee',
      allowProposal: false,
      issueGenerated: false,
      parameters: [
        {
          id: 1,
          text: 'Maintenance Fee',
          value: 'maintenanceFee',
        },
        {
          id: 2,
          text: 'Maintenance Interval',
          value: 'maintenanceInterval',
        },
        {
          id: 3,
          text: 'Node Reward Amount',
          value: 'nodeRewardAmount',
        },
        {
          id: 4,
          text: 'Node Reward Interval',
          value: 'nodeRewardInterval',
        },
        {
          id: 5,
          text: 'Transaction Fee',
          value: 'transactionFee',
        },
        {
          id: 6,
          text: 'Proposal Fee',
          value: 'proposalFee',
        },
        {
          id: 7,
          text: 'Stake Required',
          value: 'stakeRequired',
        },
        {
          id: 8,
          text: 'Node Penalty',
          value: 'nodePenalty',
        },
      ],
      newValue: '',
      nextProposalStart: null,
      proposalWindowChecker: null,
      proposalWindowTimer: null,
      issueChecker: null,
      remainingSecondToProposalWindow: null,
      window: null,
      devWindow: null,
      previousWindow: null,
      loading: true,
      form: {
        devProposalFee: '',
        maintenanceFee: '',
        maintenanceInterval: '',
        nodePenalty: '',
        nodeRewardAmount: '',
        nodeRewardInterval: '',
        proposalFee: '',
        stakeRequired: '',
        transactionFee: '',
        description: '',
        title: '',
        faucetAmount: '',
        defaultToll: '',
      },
    };
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      getWindowFocus: 'chat/getWindowFocus',
    }),
    secondsToDhms() {
      let seconds = this.remainingSecondToProposalWindow;
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
    currentWindowName() {
      // console.log(`NOW: ${new Date()}`)
      // console.log(`APPLY END: ${new Date(this.window.applyWindow[1])}`)
      if (!this.window) return;
      const now = Date.now();
      if (
        now >= this.window.proposalWindow[0] &&
        now < this.window.proposalWindow[1]
      ) {
        return 'PROPOSAL';
      } else if (
        now >= this.window.votingWindow[0] &&
        now < this.window.votingWindow[1]
      ) {
        return 'VOTING';
      } else if (
        now >= this.window.graceWindow[0] &&
        now < this.window.graceWindow[1]
      ) {
        return 'GRACE';
      } else if (
        now >= this.window.applyWindow[0] &&
        now < this.window.applyWindow[1]
      ) {
        return 'APPLY';
      }
    },
  },
  mounted: async function() {
    this.allowProposal = await this.isProposalWindowOpen();
    this.getRemainingSecondToProposal();

    this.proposalWindowChecker = setInterval(async () => {
      this.allowProposal = await this.isProposalWindowOpen();
    }, 10000);
    this.proposalWindowTimer = setInterval(
      this.getRemainingSecondToProposal,
      1000
    );
    this.issueChecker = setInterval(this.checkIssueGenerated, 10000);
  },
  beforeDestroy: function() {
    console.log('Clearing proposal window checker...');
    clearInterval(this.proposalWindowChecker);
    clearInterval(this.proposalWindowTimer);
    clearInterval(this.issueChecker);
    this.proposalWindowChecker = null;
    this.proposalWindowTimer = null;
    this.issueChecker = null;
  },
  methods: {
    formatDate(ts) {
      return moment(ts);
    },
    async checkIssueGenerated() {
      if (this.allowProposal) {
        const proposalCount = await utils.getProposalCount();
        if (proposalCount) this.issueGenerated = true;
        else this.issueGenerated = false;
      } else {
        this.issueGenerated = false;
      }
    },
    async onSubmitProposal(e) {
      e.preventDefault();
      try {
        let myWallet = this.getWallet;
        let newParameters = {};
        for (let key in this.form) {
          if (key === 'description' || key === 'title') {
            newParameters[key] = this.form[key];
          } else {
            newParameters[key] = parseFloat(this.form[key]);
          }
        }
        let proposalTx = await utils.createProposal(myWallet, newParameters);
        console.log(proposalTx);
        let isSubmitted = await utils.submitProposl(proposalTx);
        if (isSubmitted) {
          this.$ons.notification.alert('Your proposal is submitted.');
          this.newValue = '';
          this.redirect('/');
        } else {
          this.$ons.notification.alert('Failed to submit proposal');
        }
      } catch (e) {
        console.error(e.message);
        this.$ons.notification.alert(`Fail to submit: ${e.message}`);
      }
    },
    redirect(url) {
      this.$router.push(url);
    },
    async isProposalWindowOpen() {
      if (!this.getWindowFocus) return;
      try {
        let newNetworkParameters = await utils.queryParameters('/proposal/new');
        if (!this.networkParameters) {
          this.networkParameters = newNetworkParameters;
          this.form = Object.assign({}, this.networkParameters.current);
          this.form.title = '';
          this.form.description = '';
        }
        if (!this.previousWindow) {
          this.window = newNetworkParameters['windows'];
          this.devWindow = newNetworkParameters['devWindows'];
          this.previousWindow = newNetworkParameters['windows'];
        } else if (
          newNetworkParameters['windows'].proposalWindow[0] > Date.now()
        ) {
          // this.window = JSON.parse(JSON.stringify(this.previousWindow))
          this.window = { ...this.previousWindow };
        } else {
          this.window = newNetworkParameters['windows'];
          this.previousWindow = newNetworkParameters['windows'];
        }

        const proposalWindow = this.window.proposalWindow;
        this.loading = false;
        // console.log(formatDate(proposalWindow[0]), formatDate(proposalWindow[1]));

        if (
          this.window.proposalWindow &&
          this.window.proposalWindow[0] >= Date.now()
        ) {
          this.nextProposalStart = this.window.proposalWindow[0];
        } else {
          const wholeCycleDuration = utils.calculateWholeCycleDuration(
            this.window,
            this.devWindow
          );
          this.nextProposalStart = proposalWindow[0] + wholeCycleDuration;
        }

        let now = Date.now();
        if (proposalWindow[0] > now) this.nextProposalStart = proposalWindow[0];
        if (now > proposalWindow[0] && now < proposalWindow[1]) {
          return true;
        }
        return false;
      } catch (e) {
        console.warn(e);
        this.loading = false;
        return false;
      }
    },
    getRemainingSecondToProposal() {
      if (!this.getWindowFocus) return;
      if (this.window && this.window.proposalWindow) {
        let now = Date.now();
        if (!this.allowProposal) {
          if (now < this.window.proposalWindow[0]) {
            this.remainingSecondToProposalWindow = Math.round(
              (this.window.proposalWindow[0] - now) / 1000
            );
          } else if (
            now > this.window.proposalWindow[0] &&
            this.nextProposalStart &&
            now < this.nextProposalStart
          ) {
            this.remainingSecondToProposalWindow = Math.round(
              (this.nextProposalStart - now) / 1000
            );
          }
        } else if (this.allowProposal) {
          if (this.window.proposalWindow[1] >= now) {
            this.remainingSecondToProposalWindow = Math.round(
              (this.window.proposalWindow[1] - now) / 1000
            );
          }
        }
      }
    },
  },
};
</script>
<style lang="scss">
.proposal-create-container {
  width: 90%;
  max-width: 600px;
  margin: 20px auto;
  .loading-status {
    text-align: center;
    margin: 20px auto;
    position: relative;
    top: 100px;
  }
  p {
    text-align: left;
  }
  table {
    width: 100%;
    padding: 15px;
    box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.08), 0 4px 8px 0 rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    margin-bottom: 20px;
    th {
      padding-top: 20px;
    }
    tr {
      height: 40px;
      td {
        text-align: center;
        padding-left: 10px !important;
        input {
          padding: 10px;
          display: block;
          height: 30px;
          font-size: 14px;
          max-width: 80px;
          margin: 0 auto;
          border-radius: 5px;
          box-shadow: none;
          border: 1px solid #d5d5d5;
        }
      }
      td:nth-of-type(1) {
        text-align: left;
      }
    }
    thead {
      tr {
        font-weight: bold;
      }
    }
  }
}

.proposal-create-container > div {
  margin: 10px auto;
  width: 100%;
}
.drop-down-icon {
  color: #0a2463;
  position: relative;
  top: -30px;
  float: right;
  left: -20px;
}
.description-input {
  background: #ffffff;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.08), 0 4px 8px 0 rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  border: none;
  width: 100%;
  max-width: 600px;
  padding: 20px;
  font-family: Poppins;
  font-size: 14px;
  color: #484848;
  letter-spacing: 0.17px;
  line-height: 20px;
}
.add-new-choice {
  font-family: Poppins;
  font-size: 14px;
  color: #0a2463;
  letter-spacing: 0;
  line-height: 20px;
  text-align: center;
  background: transparent;
  border: none;
  width: 300px;
  margin: 30px auto;
  display: block;
  cursor: pointer;
  outline: none;
}
.add-new-choice .ons-icon.ion-ios-add {
  font-size: 20px;
  margin-right: 15px;
  width: 20px;
  height: 20px;
  border-radius: 20px;
  background: #fff;
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
}
.coin-usage-warning {
  font-family: Poppins;
  font-size: 12px;
  color: #6a6a6a;
  letter-spacing: 0;
  line-height: 20px;
}
</style>
