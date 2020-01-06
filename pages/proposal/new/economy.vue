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
    <form class="proposal-create-container" @submit="onSubmitProposal">
      <h2 class="title-2">New Change Proposal</h2>
      <div v-if="loading" class="loading-status">
        <v-ons-progress-circular indeterminate></v-ons-progress-circular>
      </div>
      <div class="loading-status" v-else-if="!loading && !window">
        Unable to get proposal window from server
      </div>
      <div v-else>
        <p class="body">Submit new proposal when proposal window is active.</p>
        <window-info
          v-if="window"
          :window="window"
          :currentWindowName="currentWindowName"
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
              <td class="parameter-name">Funding Proposal Fee</td>
              <td class="current-value">
                {{ networkParameters.CURRENT.devProposalFee }}
              </td>
              <td class="new-value">
                <input v-model="form.devProposalFee" required />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">Min. Maintenance Fee</td>
              <td class="current-value">
                {{ networkParameters.CURRENT.maintenanceFee }}
              </td>
              <td class="new-value">
                <input type="number" v-model="form.maintenanceFee" required />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">Maintenance Interval</td>
              <td class="current-value">
                {{ networkParameters.CURRENT.maintenanceInterval }}
              </td>
              <td class="new-value">
                <input
                  type="number"
                  v-model="form.maintenanceInterval"
                  required
                />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">Node Penalty</td>
              <td class="current-value">
                {{ networkParameters.CURRENT.nodePenalty }}
              </td>
              <td class="new-value">
                <input type="number" v-model="form.nodePenalty" required />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">Node Reward Amount</td>
              <td class="current-value">
                {{ networkParameters.CURRENT.nodeRewardAmount }}
              </td>
              <td class="new-value">
                <input type="number" v-model="form.nodeRewardAmount" required />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">Node Reward Interval</td>
              <td class="current-value">
                {{ networkParameters.CURRENT.nodeRewardInterval }}
              </td>
              <td class="new-value">
                <input
                  type="number"
                  v-model="form.nodeRewardInterval"
                  required
                />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">Proposal Fee</td>
              <td class="current-value">
                {{ networkParameters.CURRENT.proposalFee }}
              </td>
              <td class="new-value">
                <input type="number" v-model="form.proposalFee" required />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">Stake Required</td>
              <td class="current-value">
                {{ networkParameters.CURRENT.stakeRequired }}
              </td>
              <td class="new-value">
                <input type="number" v-model="form.stakeRequired" required />
              </td>
            </tr>
            <tr>
              <td class="parameter-name">Transaction Fee</td>
              <td class="current-value">
                {{ networkParameters.CURRENT.transactionFee }}
              </td>
              <td class="new-value">
                <input type="number" v-model="form.transactionFee" required />
              </td>
            </tr>
          </tbody>
        </table>

        <!-- <div>
          <p class="label">Select a parameter to change</p>
          <div class="drop-down-container">
            <v-ons-select style="width: 40%" v-model="selectedParameter">
              <option
                v-for="item in parameters"
                :value="item.value"
                :key="item.id"
                >{{ item.text }}</option
              >
            </v-ons-select>
            <v-ons-icon
              icon="ion-ios-arrow-down"
              size="lg"
              class="drop-down-icon"
            ></v-ons-icon>
          </div>
        </div> -->

        <div>
          <p class="label">Description</p>
          <textarea
            name="description-input"
            class="description-input"
            v-model="form.description"
            cols="30"
            rows="5"
          ></textarea>
        </div>

        <!-- <div>
          <p class="label">Enter proposed value</p>
          <input
            "
            placeholder="Proposed value"
            v-model="newValue"
            class="text-input"
            autocorrect="off"
            autocomplete="off"
            autocapitalize="off"
          />
        </div> -->
        <p class="coin-usage-warning" v-if="!allowProposal">
          Proposal window will start on
          <strong v-if="nextProposalStart">{{
            formatDate(nextProposalStart)
          }}</strong>
        </p>
        <p class="coin-usage-warning" v-else>
          Started on
          <strong>{{ formatDate(window.proposalWindow[0]) }}</strong
          >.
        </p>
        <Button
          text="Submit Proposal"
          type="submit"
          :onClick="onSubmitProposal"
          :isDisabled="!allowProposal"
        />
      </div>
    </form>
  </v-ons-page>
</template>

<script>
import Vue from 'vue'
import moment from 'moment'
import 'onsenui/css/onsenui.css'
import 'onsenui/css/onsen-css-components.css'
import VueOnsen from 'vue-onsenui/esm'
import OnsenComponents from '~/components/Onsen'
import ChatText from '~/components/ChatText'
import ChatInput from '~/components/ChatInput'
import { mapGetters, mapActions } from 'vuex'
import utils from '../../../assets/utils'
import ToolBar from '~/components/ToolBar'
import ProposalListItem from '~/components/ProposalListItem'
import WindowInfo from '~/components/WindowInfo'
import Choice from '~/components/Choice'
import Title from '~/components/baisc/Title'
import Button from '~/components/baisc/Button'

Vue.use(VueOnsen)
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c))

export default {
  components: {
    ToolBar,
    WindowInfo,
    Button,
    Title,
    Choice
  },
  data: function () {
    return {
      networkParameters: null,
      selectedParameter: 'transactionFee',
      allowProposal: false,
      parameters: [
        {
          id: 1,
          text: 'Maintenance Fee',
          value: 'maintenanceFee'
        },
        {
          id: 2,
          text: 'Maintenance Interval',
          value: 'maintenanceInterval'
        },
        {
          id: 3,
          text: 'Node Reward Amount',
          value: 'nodeRewardAmount'
        },
        {
          id: 4,
          text: 'Node Reward Interval',
          value: 'nodeRewardInterval'
        },
        {
          id: 5,
          text: 'Transaction Fee',
          value: 'transactionFee'
        },
        {
          id: 6,
          text: 'Proposal Fee',
          value: 'proposalFee'
        },
        {
          id: 7,
          text: 'Stake Required',
          value: 'stakeRequired'
        },
        {
          id: 8,
          text: 'Node Penalty',
          value: 'nodePenalty'
        }
      ],
      newValue: '',

      nextProposalStart: null,
      proposalWindowChecker: null,
      window: null,
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
        description: ''
      }
    }
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState'
    }),
    currentWindowName () {
      if (!this.window) return
      const now = Date.now()
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
    }
  },
  mounted: async function () {
    this.proposalWindowChecker = setInterval(async () => {
      this.allowProposal = await this.isProposalWindowOpen()
    }, 3000)
  },
  beforeDestroy: function () {
    console.log('Clearing proposal window checker...')
    clearInterval(this.proposalWindowChecker)
  },
  methods: {
    formatDate (ts) {
      return moment(ts)
    },
    async onSubmitProposal (e) {
      e.preventDefault()
      let myWallet = this.getWallet
      let newParameters = {}
      for (let key in this.form) {
        newParameters[key] = parseFloat(this.form[key])
      }
      console.log(newParameters)
      let proposalTx = await utils.createProposal(myWallet, newParameters)
      console.log(proposalTx)
      let isSubmitted = await utils.submitProposl(proposalTx)
      if (isSubmitted) {
        this.$ons.notification.alert('Your proposal is submitted.')
        this.newValue = ''
        this.redirect('/')
      } else {
        this.$ons.notification.alert('Failed to submit proposal')
      }
    },
    redirect (url) {
      this.$router.push(url)
    },
    decideCurrentWindow () {},
    async isProposalWindowOpen () {
      try {
        // this.loading = true;
        let newNetworkParameters = await utils.queryParameters()
        if (!this.networkParameters) {
          this.networkParameters = newNetworkParameters
          this.form = Object.assign({}, this.networkParameters.CURRENT)
        }
        this.window = newNetworkParameters['WINDOWS']
        const proposalWindow = this.window.proposalWindow
        this.loading = false
        // console.log(formatDate(proposalWindow[0]), formatDate(proposalWindow[1]));

        if (this.window.proposalWindow) {
          this.nextProposalStart = this.window.proposalWindow[0]
        } else {
          this.nextProposalStart = proposalWindow[1] + 1000 * 60 * 4
        }

        let now = Date.now()
        if (proposalWindow[0] > now) this.nextProposalStart = proposalWindow[0]
        if (now > proposalWindow[0] && now < proposalWindow[1]) {
          return true
        }
        return false
      } catch (e) {
        console.warn(e)
        this.loading = false
        return false
      }
    }
  }
}
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
    tr {
      height: 40px;
      td {
        text-align: center;
        input {
          padding: 10px;
          display: block;
          height: 30px;
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
