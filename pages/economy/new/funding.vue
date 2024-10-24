<template>
  <!-- <v-ons-page> -->
  <div>
    <!-- <tool-bar
      :option="{
        menu: false,
        notification: false,
        back: true,
        redirectUrl: '/'
      }"
    /> -->
    <!-- {{ window }} -->
    <div class="funding-create-container">  
      <portal to="navigation-tags">
        <a-breadcrumb>
          <a-breadcrumb-item>
            <nuxt-link to="/funding">Funding</nuxt-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>New Funding</a-breadcrumb-item>
        </a-breadcrumb>
      </portal>

      <h2>
        Development Funding Proposal
      </h2>
      <div
        v-if="loading"
        class="loading-status"
      >
        <v-ons-progress-circular indeterminate />
      </div>
      <div
        v-else-if="!loading && (!window || !window.devProposalWindow)"
      >
        Unable to get funding proposal window from server
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
        <div>
          <p class="input-label-text">
            Title
          </p>
          <a-input
            v-model="title"
            size="large"
            placeholder="Input title"
          />
        </div>

        <div>
          <p class="input-label-text">
            Description
          </p>
          <a-textarea
            v-model="description"
            name="description-input"
            cols="30"
            rows="5"
            placeholder="Input description"
          />
        </div>

        <div>
          <p class="input-label-text">
            Proposed Amount
          </p>
          <a-input
            v-model="amount"
            placeholder="Input amount"
          />
        </div>
        <div>
          <p class="input-label-text">
            Payment Plan
          </p>
          <div class="drop-down-container">
            <a-radio-group
              v-model="selectedPaymentType"
              style="width: 40%"
            >
              <a-radio-button
                v-for="item in paymentType"
                :key="item.id"
                :value="item.value"
              >
                {{ item.text }}
              </a-radio-button>
            </a-radio-group>
          </div>
        </div>

        <div v-if="selectedPaymentType === 'multiple'">
          <p class="input-label-text">
            Payment Count
          </p>
          <a-input
            v-model="paymentCount"
            type="text"
            placeholder="5"
          />
        </div>

        <div v-if="selectedPaymentType === 'multiple'">
          <p class="input-label-text">
            Delay between payments (in minutes)
          </p>
          <a-input
            v-model="delay"
            type="text"
            placeholder="0"
          />
        </div>
        <p
          v-if="!allowProposal"
          class="coin-usage-warning"
        >
          Proposal window will start in
          <strong v-if="nextDevProposalStart">{{ secondsToDhms }}</strong>
        </p>
        <p
          v-else
          class="coin-usage-warning"
        >
          Proposal window will expire in
          <strong>{{ secondsToDhms }}</strong>.
        </p>
        <p v-if="allowProposal && !isDevIssueGenerated">
          Waiting to get developer issue number.
        </p>
        <a-button
          @click="onSubmitProposal"
          :disabled="!allowProposal || !isDevIssueGenerated"
          size="large"
          style="width:100%;"
          type="primary"
        >
          Submit Proposal
        </a-button>
        <p
          v-if="
            networkParameters.current.devProposalFee &&
              networkParameters.current.transactionFee
          "
        >
          Submitting proposal will cost Proposal Fee:
          <strong>{{ networkParameters.current.devProposalFee }}</strong> coins
          + Transaction Fee:
          <strong>{{ networkParameters.current.transactionFee }}</strong> coins
        </p>
      </div>
    </div>
  <!-- </v-ons-page> -->
  </div>
</template>

<script>
import Vue from 'vue'
import 'onsenui/css/onsenui.css'
import 'onsenui/css/onsen-css-components.css'
import VueOnsen from 'vue-onsenui/esm'
import OnsenComponents from '~/components/Onsen'
import ChatText from '~/components/ChatText'
import ChatInput from '~/components/ChatInput'
import WindowInfo from '~/components/WindowInfo'
import { mapGetters, mapActions } from 'vuex'
import utils from '../../../assets/utils'
import ToolBar from '~/components/ToolBar'
import ProposalListItem from '~/components/ProposalListItem'
import Choice from '~/components/Choice'
import Title from '~/components/baisc/Title'
import Button from '~/components/baisc/Button'

Vue.use(VueOnsen)
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c))

export default {
  components: {
    ToolBar,
    Button,
    WindowInfo,
    Title,
    Choice
  },
  layout: 'dashboard',
  data: function () {
    return {
      selectedPaymentType: 'single',
      amount: '',
      title: '',
      description: '',
      paymentType: [
        {
          id: 1,
          text: 'Single',
          value: 'single'
        },
        {
          id: 2,
          text: 'Multiple',
          value: 'multiple'
        }
      ],
      paymentCount: 1,
      delay: 0,
      allowProposal: false,
      networkParameters: null,
      nextDevProposalStart: null,
      proposalWindowChecker: null,
      proposalWindowTimer: null,
      remainingSecondToProposalWindow: null,
      loading: true,
      window: null,
      previousWindow: null,
      isDevIssueGenerated: null
    }
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      getWindowFocus: 'chat/getWindowFocus'
    }),
    secondsToDhms () {
      let seconds = this.remainingSecondToProposalWindow
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
    currentWindowName () {
      if (!this.window) return
      const now = Date.now()
      try {
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
      } catch (e) {
        return null
      }
    }
  },
  mounted: async function () {
    this.allowProposal = await this.isDevProposalWindowOpen()
    this.getRemainingSecondToProposal()

    this.proposalWindowChecker = setInterval(async () => {
      this.allowProposal = await this.isDevProposalWindowOpen()
      this.isDevIssueGenerated = await this.checkDevIssue()
    }, 10000)

    this.proposalWindowTimer = setInterval(
      this.getRemainingSecondToProposal,
      1000
    )
  },
  beforeDestroy: function () {
    clearInterval(this.proposalWindowChecker)
    clearInterval(this.proposalWindowTimer)
    this.proposalWindowTimer = null
    this.proposalWindowTimer = null
  },
  methods: {
    async checkDevIssue () {
      if (!this.getWindowFocus) return
      let latestDevIssue = await utils.queryLatestDevIssue()
      if (latestDevIssue) return true
    },
    async isDevProposalWindowOpen () {
      try {
        if (!this.getWindowFocus) return
        console.log('Checking if dev proposal window is opened')
        // this.loading = true
        let networkParameters = await utils.queryParameters()
        console.log(networkParameters)
        if (!this.networkParameters) this.networkParameters = networkParameters
        if (!this.previousWindow) {
          this.window = networkParameters['devWindows']
          this.previousWindow = networkParameters['devWindows']
        } else if (
          networkParameters['devWindows'].devProposalWindow[0] > Date.now()
        ) {
          this.window = { ...this.previousWindow }
        } else {
          this.window = networkParameters['devWindows']
          this.previousWindow = networkParameters['devWindows']
        }

        let proposalWindow = this.window.devProposalWindow
        let applyWindow = this.window.devApplyWindow
        this.loading = false
        if (
          this.window.devProposalWindow &&
          this.window.devProposalWindow >= Date.now()
        ) {
          this.nextDevProposalStart = this.window.devProposalWindow[0]
        } else {
          const wholeCycleDuration = utils.calculateWholeCycleDuration(
            this.window
          )
          this.nextDevProposalStart =
            this.window.devProposalWindow[0] + wholeCycleDuration
        }
        let now = Date.now()
        if (now > proposalWindow[0] && now < proposalWindow[1]) {
          return true
        }
        return false
      } catch (e) {
        this.loading = false
        return false
      }
    },
    redirect (url) {
      this.$router.push(url)
    },
    async onSubmitProposal () {
      try {
        let myWallet = this.getWallet
        let proposal = {
          description: this.description,
          totalAmount: parseFloat(this.amount),
          paymentCount: parseInt(this.paymentCount),
          delay: this.delay * 60 * 1000,
          paymentType: this.selectedPaymentType,
          title: this.title
        }
        let proposalTx = await utils.createDevProposal(myWallet, proposal)
        console.log(proposalTx)
        let isSubmitted = await utils.submitProposl(proposalTx)
        if (isSubmitted) {
          this.$ons.notification.alert('Dev Proposal is submitted.')
          this.amount = ''
          this.selectedPaymentType = 'single'
          this.delay = 0
          this.paymentCount = 1
          this.title = ''
          this.description = ''
          this.redirect('/')
        }
      } catch (e) {
        console.error(e)
        console.error(e.message)
        this.$ons.notification.alert(`Fail to submit: ${e.message}`)
        // this.amount = ''
        // this.selectedPaymentType = 'single'
        // this.delay = 0
        // this.paymentCount = 1
        // this.title = ''
        // this.description = ''
        // this.redirect('/')
      }
    },
    getRemainingSecondToProposal () {
      if (!this.getWindowFocus) return
      if (this.window) {
        let now = Date.now()
        if (!this.allowProposal) {
          if (now < this.window.devProposalWindow[0]) {
            this.remainingSecondToProposalWindow = Math.round(
              (this.window.devProposalWindow[0] - now) / 1000
            )
          } else if (
            now > this.window.devProposalWindow[0] &&
            this.nextDevProposalStart &&
            now < this.nextDevProposalStart
          ) {
            this.remainingSecondToProposalWindow = Math.round(
              (this.nextDevProposalStart - now) / 1000
            )
          }
        } else if (this.allowProposal) {
          if (this.window.devProposalWindow[1] >= now) {
            this.remainingSecondToProposalWindow = Math.round(
              (this.window.devProposalWindow[1] - now) / 1000
            )
          }
        }
      }
    }
  }
}
</script>

<style lang="scss">
.funding-create-container {
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

  .input-label-text {
    margin-top: 20px;
  }
}
.funding-create-container > div {
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
  margin: 15px auto;
}
</style>
